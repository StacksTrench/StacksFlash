;; Flash Loan Provider
;; Uncollateralized loans that must be repaid in same transaction

(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u100))
(define-constant err-insufficient-liquidity (err u101))
(define-constant err-loan-not-repaid (err u102))
(define-constant err-reentrant (err u103))

(define-data-var total-liquidity uint u0)
(define-data-var flash-loan-fee uint u9) ;; 0.09% fee
(define-data-var locked bool false)

(define-trait flash-borrower-trait
  (
    (execute-operation (uint uint) (response bool uint))
  )
)

(define-read-only (get-available-liquidity)
  (var-get total-liquidity)
)

(define-read-only (calculate-fee (amount uint))
  (/ (* amount (var-get flash-loan-fee)) u10000)
)

(define-public (provide-liquidity (amount uint))
  (begin
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (var-set total-liquidity (+ (var-get total-liquidity) amount))
    (ok amount)
  )
)

(define-public (withdraw-fees (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (as-contract (stx-transfer? amount tx-sender recipient))
  )
)

(define-public (flash-loan (amount uint) (borrower <flash-borrower-trait>))
  (let (
    (fee (calculate-fee amount))
    (total-repay (+ amount fee))
    (sender tx-sender)
  )
    ;; Reentrancy Guard
    (asserts! (not (var-get locked)) err-reentrant)
    (var-set locked true)
    
    ;; 1. Check liquidity
    (asserts! (>= (var-get total-liquidity) amount) err-insufficient-liquidity)
    
    ;; 2. Transfer loan to borrower
    (try! (as-contract (stx-transfer? amount tx-sender sender)))
    
    ;; 3. Callback: Borrower executes logic
    (match (contract-call? borrower execute-operation amount fee)
      success 
        (begin
           ;; 4. Verify repayment
           (match (stx-transfer? total-repay sender (as-contract tx-sender))
             repay-success
               (begin
                 (var-set total-liquidity (+ (var-get total-liquidity) fee))
                 (var-set locked false) ;; Unlock
                 (ok total-repay)
               )
             repay-error
               (begin
                 (var-set locked false) ;; Unlock on error
                 (err err-loan-not-repaid)
               )
           )
        )
      failure
        (begin
           (var-set locked false) ;; Unlock on error
           (err err-loan-not-repaid)
        )
    )
  )
)

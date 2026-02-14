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
(define-data-var accumulated-fees uint u0)

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

(define-public (withdraw-all-fees (recipient principal))
  (let ((fees (var-get accumulated-fees)))
    (begin
      (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
      (asserts! (> fees u0) (err u104))
      (var-set accumulated-fees u0)
      (as-contract (stx-transfer? fees tx-sender recipient))
    )
  )
)

(define-public (flash-loan (amount uint) (borrower <flash-borrower-trait>))
  (let (
    (fee (calculate-fee amount))
    (total-repay (+ amount fee))
    (sender tx-sender)
  )
    ;; Check reentrancy
    (asserts! (not (var-get locked)) (err err-reentrant))
    (var-set locked true)
    
    ;; Check liquidity
    (if (>= (var-get total-liquidity) amount)
      (begin
        ;; Transfer to borrower
        (match (as-contract (stx-transfer? amount tx-sender sender))
          transfer-success
            (begin
              ;; Execute borrower's operation
              (match (contract-call? borrower execute-operation amount fee)
                operation-success
                  (begin
                    ;; Get repayment
                    (match (stx-transfer? total-repay sender (as-contract tx-sender))
                      repayment-success
                        (begin
                          (var-set accumulated-fees (+ (var-get accumulated-fees) fee))
                          (var-set total-liquidity (+ (var-get total-liquidity) amount))
                          (var-set locked false)
                          (ok total-repay)
                        )
                      repayment-error
                        (begin
                          (var-set locked false)
                          (err err-loan-not-repaid)
                        )
                    )
                  )
                operation-failure
                  (begin
                    (var-set locked false)
                    (err err-loan-not-repaid)
                  )
              )
            )
          transfer-error
            (begin
              (var-set locked false)
              (err err-insufficient-liquidity)
            )
        )
      )
      (begin
        (var-set locked false)
        (err err-insufficient-liquidity)
      )
    )
  )
)

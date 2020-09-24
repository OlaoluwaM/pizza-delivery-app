import React from 'react';
import styled from 'styled-components';
import OrderItem from './OrderItem';

import { Elements } from '@stripe/react-stripe-js';
import { getTotal } from './local-utils/helpers';
import { loadStripe } from '@stripe/stripe-js';
import { useRecoilValue } from 'recoil';
import { default as Checkout, Modal } from './Checkout';
import { cartState as cartStateAtom } from './atoms';
import { CartCheckFill as PaymentIcon } from '@styled-icons/bootstrap/CartCheckFill';
import { ReactComponent as EmptyCartSVG } from '../assets/undraw_empty_xct9.svg';
import { cartPreviewVariants, emptyCartVectorVariants } from './local-utils/framer-variants';
import { m as motion, AnimatePresence, AnimateSharedLayout, useCycle } from 'framer-motion';

const { REACT_APP_STRIPE_API_KEY: STRIPE_API_KEY } = process.env;
const stripePromise = loadStripe(STRIPE_API_KEY);

const CartPreviewContainer = styled(motion.section).attrs({
  className: 'section-container',
  variants: cartPreviewVariants,
  animate: 'visible',
  initial: 'hidden',
  exit: 'exit',
})`
  display: flex;
  z-index: 1;
  flex-direction: column;
  padding: 0 1.5em 0 3.5em;
  position: relative;

  & > .svg-container {
    display: content;

    svg {
      position: absolute;
      scale: 0.6;
      left: 50%;
      transform: translateX(-78%);
    }
  }
`;

const CartContainer = styled.div`
  list-style: none;
  flex-grow: 1;
  height: 100%;

  h3 {
    text-align: left;
    font-size: 2em;
    margin: 3em 0 1em 0;
    font-family: var(--primaryFont);
    font-weight: var(--xBold);
  }

  button.checkout-button {
    svg {
      width: 15%;
    }

    &:hover,
    &:active {
      background: ${({ theme }) => theme.black};
      color: ${({ theme }) => theme.background};
    }
  }
`;

const Cart = styled(motion.ul)`
  padding: 0;
  margin: 0;
  width: 100%;
  height: auto;
  list-style: none;
`;

export default function CartPreview({ initialCart }) {
  const [showModal, cycleModal] = useCycle(false, true);

  const cartObject = initialCart ?? useRecoilValue(cartStateAtom);
  const cart = Object.entries(cartObject);
  const cartIsEmpty = cart.length === 0;
  const cartTotal = getTotal(cartObject).toFixed(2);

  const showCheckoutModal = () => cycleModal();

  return (
    <>
      <AnimatePresence>
        {showModal ? (
          <Elements stripe={stripePromise} key="stripe-elements">
            <Modal key="modal" closeModal={showCheckoutModal}>
              <Checkout total={cartTotal} />
            </Modal>
          </Elements>
        ) : null}
      </AnimatePresence>

      <CartPreviewContainer>
        {cartIsEmpty && (
          <motion.div
            className="svg-container"
            variants={emptyCartVectorVariants}
            animate="visible"
            initial="hidden"
            exit="hidden">
            <EmptyCartSVG data-testid="empty-cart-svg" />
          </motion.div>
        )}

        <CartContainer>
          <motion.h3 data-testid="cart-header" layout>
            {`Your Cart ${cartIsEmpty ? 'is empty' : ''}`}
          </motion.h3>

          <AnimateSharedLayout>
            {!cartIsEmpty && (
              <AnimatePresence>
                <>
                  <Cart layoutId="cart">
                    {cart.map(([orderName, { quantity, initialPrice, type }], i) => (
                      <OrderItem
                        key={orderName}
                        orderName={orderName}
                        quantity={quantity}
                        foodType={type}
                        initialPrice={initialPrice}
                      />
                    ))}
                  </Cart>
                  <motion.p className="total" layout>
                    Total: <span data-testid="cart-total">{`$${cartTotal}`}</span>
                  </motion.p>
                </>
                <motion.button
                  className="checkout-button"
                  layout
                  onClick={showCheckoutModal}
                  key="checkout-button">
                  <PaymentIcon />
                  Place Order
                </motion.button>
              </AnimatePresence>
            )}
          </AnimateSharedLayout>
        </CartContainer>
      </CartPreviewContainer>
    </>
  );
}

CartPreview.whyDidYouRender = true;

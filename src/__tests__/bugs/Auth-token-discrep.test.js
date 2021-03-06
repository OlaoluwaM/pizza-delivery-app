import React from 'react';
import Authenticate from '../../components/Auth';

import { cleanup, fireEvent, act, screen } from '@testing-library/react';

afterAll(cleanup);

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('User has token but it does not exist on the server side', async () => {
  fetch.mockRejectOnce(
    'There was an error deleting file "c40d973ce606c375656c192e" from tokens. Error: ENOENT: no such file or directory, unlink "D:OlaoluwaDesktoppizza-delivery-appserver.data\tokensc40d973ce606c375656c192e.json"',
    { status: 500 }
  );

  const utils = renderWithProviders(<Authenticate />);

  const switchText = await screen.findByText(/already a mem/i);
  fireEvent.click(switchText);

  const { findByRole, getByPlaceholderText } = utils;

  const submitButton = await findByRole('button');

  const dataToPass = {
    Email: 'dedede@gmail.com',
    Password: 'IAmAwesome@2003300',
  };

  await act(async () => {
    fireEvent.input(getByPlaceholderText('Email'), { target: { value: dataToPass['Email'] } });

    fireEvent.input(getByPlaceholderText('Password'), {
      target: { value: dataToPass['Password'] },
    });

    fireEvent.click(submitButton);
  });

  expect(true).toBe(true);
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AuthPage from './index';

const signInWithOtp = vi.fn();
const verifyOtp = vi.fn();

vi.mock('@/lib/auth/context', () => ({
  useAuth: () => ({ signInWithOtp, verifyOtp }),
}));

async function reachCodeStep() {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <AuthPage />
    </MemoryRouter>
  );
  await user.type(screen.getByLabelText(/email/i), 'someone@example.com');
  await user.click(screen.getByRole('button', { name: /send code/i }));
  const codeInput = await screen.findByLabelText('Verification Code');
  return { user, codeInput };
}

describe('AuthPage verification code field', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signInWithOtp.mockResolvedValue({ error: null });
    verifyOtp.mockResolvedValue({ error: null });
  });

  it('drops spaces and other non-digits, e.g. the trailing space copied from the email', async () => {
    const { user, codeInput } = await reachCodeStep();

    await user.click(codeInput);
    await user.paste('123456 ');
    expect(codeInput).toHaveValue('123456');

    await user.clear(codeInput);
    await user.paste('123 456');
    expect(codeInput).toHaveValue('123456');
  });

  it('verifies with the cleaned code', async () => {
    const { user, codeInput } = await reachCodeStep();

    await user.click(codeInput);
    await user.paste('654321 ');
    await user.click(screen.getByRole('button', { name: /verify code/i }));

    await waitFor(() => expect(verifyOtp).toHaveBeenCalledWith('someone@example.com', '654321'));
  });
});

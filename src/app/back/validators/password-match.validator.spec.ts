import { PasswordMatchValidator } from './password-match.validator';

describe('PasswordMatchValidator', () => {
  it('should create an instance', () => {
    expect(PasswordMatchValidator('password', 'confirmPassword')).toBeTruthy();
  });
});

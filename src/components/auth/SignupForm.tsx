'use client';

import { useState } from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { getUsernameFeedback, getPasswordStrengthFeedback } from '@/lib/utils';

interface SignupFormProps {
  onSubmit: (
    username: string,
    password: string,
    role: 'student' | 'teacher'
  ) => Promise<void>;
  isLoading?: boolean;
}

export default function SignupForm({ onSubmit, isLoading = false }: SignupFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordFeedback(getPasswordStrengthFeedback(value));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!username) {
      newErrors.username = 'Username is required';
    } else {
      const feedback = getUsernameFeedback(username);
      if (feedback.length > 0) {
        newErrors.username = feedback[0];
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (passwordFeedback.length > 0) {
      newErrors.password = passwordFeedback[0];
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!role) {
      newErrors.role = 'Please select a role';
    }

    if (!agreeToTerms) {
      newErrors.terms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await onSubmit(username, password, role);
    } catch (error) {
      setErrors({ form: String(error) });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Error */}
      {errors.form && <Alert type="error">{errors.form}</Alert>}

      {/* Username */}
      <Input
        id="username"
        label="Username"
        type="text"
        placeholder="Choose a unique username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={errors.username}
        hint="3-50 characters, alphanumeric, underscore, hyphen"
        disabled={isLoading}
      />

      {/* Password */}
      <Input
        id="password"
        label="Password"
        type="password"
        placeholder="Create a strong password"
        value={password}
        onChange={(e) => handlePasswordChange(e.target.value)}
        error={errors.password}
        disabled={isLoading}
      />

      {/* Password Strength Feedback */}
      {password && (
        <div className="text-xs space-y-1">
          {passwordFeedback.length === 0 ? (
            <p className="text-green-600 font-semibold">✓ Strong password</p>
          ) : (
            <>
              <p className="text-gray-600 font-semibold">Password requirements:</p>
              <ul className="list-disc list-inside text-gray-500">
                {passwordFeedback.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Confirm Password */}
      <Input
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        disabled={isLoading}
      />

      {/* Role Selection */}
      <Select
        id="role"
        label="Account Type"
        value={role}
        onChange={(e) => setRole(e.target.value as 'student' | 'teacher')}
        error={errors.role}
        options={[
          { value: 'student', label: 'Student - Learn with flashcards' },
          { value: 'teacher', label: 'Teacher - Manage classrooms' },
        ]}
        disabled={isLoading}
      />

      {/* Terms Checkbox */}
      <Checkbox
        id="terms"
        label="I agree to the Terms of Service and Privacy Policy"
        checked={agreeToTerms}
        onChange={(e) => setAgreeToTerms(e.target.checked)}
        disabled={isLoading}
      />
      {errors.terms && <p className="text-sm text-red-600">{errors.terms}</p>}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={isLoading}
        disabled={isLoading}
        className="w-full"
      >
        Create Account
      </Button>
    </form>
  );
}

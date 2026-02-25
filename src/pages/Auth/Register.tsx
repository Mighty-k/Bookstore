import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GoogleLogin } from "@react-oauth/google";
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ProgressBar from "../../components/ui/ProgressBar";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const {
    register: registerUser,
    googleLogin,
    isLoading,
    error,
    isAuthenticated,
  } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    setPasswordStrength(strength);
  }, [password]);

  const onSubmit = async (data: RegisterFormData) => {
    await registerUser(data);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    await googleLogin(credentialResponse.credential);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="overflow-hidden p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-600 mt-2">Join BookHaven today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Full Name"
              placeholder="John Doe"
              error={errors.name?.message}
              leftIcon={<User className="w-5 h-5 text-gray-400" />}
              {...register("name")}
            />

            <Input
              label="Email"
              type="email"
              placeholder="john@example.com"
              error={errors.email?.message}
              leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
              {...register("email")}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                error={errors.password?.message}
                leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                {...register("password")}
              />
              {password && (
                <div className="mt-2">
                  <ProgressBar
                    value={passwordStrength}
                    color={
                      passwordStrength < 50
                        ? "red"
                        : passwordStrength < 75
                          ? "yellow"
                          : "green"
                    }
                  />
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              }
              {...register("confirmPassword")}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              Sign Up
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Or sign up with
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {}}
              theme="outline"
              size="large"
              shape="circle"
              width="300"
            />
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-800"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Register;

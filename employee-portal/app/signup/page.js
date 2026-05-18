"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  department: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const submit = async (values) => {
    try {
      await api.post("/auth/register", values);
      await login(values.email, values.password);
      toast.success("Account created");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Signup failed");
    }
  };

  return <main className="grid min-h-screen place-items-center bg-[#0a0a0f] p-4"><Card className="w-full max-w-md"><h1 className="mb-1 text-[22px] font-semibold tracking-tight text-slate-100">Employee Signup</h1><p className="mb-6 text-[13px] text-slate-500">Create an employee account.</p><form method="post" onSubmit={handleSubmit(submit)} className="space-y-4"><Input label="Full name" {...register("name")} error={errors.name?.message} /><Input label="Email" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} /><Input label="Department" {...register("department")} error={errors.department?.message} /><Input label="Password" type="password" autoComplete="new-password" {...register("password")} error={errors.password?.message} /><Button className="w-full" disabled={isSubmitting}>Create account</Button></form><p className="mt-4 text-center text-[13px] text-slate-500">Already have an account? <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300">Sign in</Link></p></Card></main>;
}

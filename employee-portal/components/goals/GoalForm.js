"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { THRUST_AREAS, UOM_TYPES } from "../../constants";

const schema = z.object({ thrustArea: z.string().min(1), title: z.string().min(1).max(200), description: z.string().optional(), uomType: z.string(), target: z.string().min(1), weightage: z.coerce.number().min(10).max(100) });

export default function GoalForm({ goal, remaining = 100, onSubmit, isSubmitting = false }) {
  const isShared = goal?.isShared;
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: goal || { thrustArea: "Operations", uomType: "min", weightage: 10 } });
  const weightage = Number(watch("weightage") || 0);
  const inputClasses = "w-full rounded-lg border border-white/[0.08] bg-[#13131a] px-3.5 py-2.5 text-[13px] text-slate-200 outline-none transition-colors placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20";
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border border-white/[0.06] bg-[#16161f] p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-[12px] font-medium text-slate-400">Thrust Area<select disabled={isShared || isSubmitting} className={`mt-1.5 appearance-none cursor-pointer ${inputClasses}`} {...register("thrustArea")}>{THRUST_AREAS.map((x) => <option key={x}>{x}</option>)}</select></label>
        <label className="block text-[12px] font-medium text-slate-400">UoM Type<select disabled={isShared || isSubmitting} className={`mt-1.5 appearance-none cursor-pointer ${inputClasses}`} {...register("uomType")}>{UOM_TYPES.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></label>
      </div>
      <Input label="Goal Title" disabled={isShared || isSubmitting} {...register("title")} error={errors.title?.message} />
      <label className="block text-[12px] font-medium text-slate-400">Description<textarea disabled={isSubmitting} className={`mt-1.5 resize-none ${inputClasses} disabled:cursor-not-allowed disabled:opacity-60`} rows="3" {...register("description")} /></label>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Target" disabled={isShared || isSubmitting} type={watch("uomType") === "timeline" ? "date" : "text"} {...register("target")} error={errors.target?.message} />
        <Input label="Weightage" disabled={isSubmitting} type="number" min="10" max="100" {...register("weightage")} error={errors.weightage?.message} />
      </div>
      <p className={remaining - weightage >= 0 ? "text-[13px] text-emerald-400" : "text-[13px] text-red-400"}>Remaining: {remaining - weightage}% available</p>
      <Button type="submit" isLoading={isSubmitting}>{isSubmitting ? "Saving Goal" : "Save Goal"}</Button>
    </form>
  );
}

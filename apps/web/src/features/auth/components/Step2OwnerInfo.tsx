"use client";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RegisterFormValues } from "@/features/auth/schema/register.schema";
import { cn } from "@/lib/utils";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

interface Step2OwnerProps {
  onBack: () => void;
  onNext: () => void;
}

export default function Step2Owner({ onBack, onNext }: Step2OwnerProps) {
  const { control } = useFormContext<RegisterFormValues>();

  return (
    <div className="space-y-5">
      <div className="relative">
        <h1 className="text-lg font-semibold text-[#00796B]">
          Thông tin của bạn
        </h1>
        <p className="text-sm text-gray-600">
          Vui lòng nhập thông tin cơ bản của bạn
        </p>
      </div>

      {/* Full Name */}
      <FormField
        control={control}
        name="fullName"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Họ và tên</FormLabel>
            <FormControl>
              <Input placeholder="Nhập họ và tên" {...field} />
            </FormControl>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />

      {/* Email */}
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="Nhập email" {...field} />
            </FormControl>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />

      {/* Phone */}
      <FormField
        control={control}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Số điện thoại</FormLabel>
            <FormControl>
              <Input placeholder="Nhập số điện thoại" {...field} />
            </FormControl>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="birthDate"
        render={() => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Ngày sinh</FormLabel>
            <FormControl>
              <Controller
                control={control}
                name="birthDate"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    value={field.value ? dayjs(field.value) : undefined}
                    onChange={(date) =>
                      field.onChange(date ? date.format("YYYY-MM-DD") : "")
                    }
                    placeholder="Chọn ngày sinh"
                    className={cn(
                      `flex w-full
                 h-12
                 rounded-full
                 border border-gray-200
                 bg-gray-50
                 px-4
                 text-sm text-gray-900
                 placeholder:text-gray-400
                 transition-all duration-200
                 focus:border-emerald-500
                 focus:ring-2 focus:ring-emerald-200
                 focus:outline-none
                 disabled:cursor-not-allowed
                 disabled:opacity-50`
                    )}
                    suffixIcon={
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                    }
                    variant="filled"
                  />
                )}
              />
            </FormControl>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />

      {/* Address */}
      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem className="flex flex-col gap-1">
            <FormLabel>Địa chỉ</FormLabel>
            <FormControl>
              <Input placeholder="Nhập địa chỉ" {...field} />
            </FormControl>
            <FormMessage className="text-red-500" />
          </FormItem>
        )}
      />

      {/* Buttons */}
      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 cursor-pointer"
        >
          Quay lại
        </Button>
        <Button onClick={onNext} className="flex-1 cursor-pointer">
          Tiếp tục
        </Button>
      </div>
    </div>
  );
}

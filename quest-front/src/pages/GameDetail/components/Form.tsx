import { useMemo } from "react";
import { z } from "zod";
import Button from "../../../components/Button";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useZodValidationResolver } from "../../../utils/hooks/useZodValidationResolver";

const inputClassName = "px-6 py-4 rounded-md bg-input-gray w-full opacity-40 placeholder:text-gray";

function createFormSchema(maxPlayersCount: number) {
  return z.object({
    user_name: z.string().min(1, "Обов'язкове поле").max(20, "Максимум 20 символів"),
    user_phone: z.string().min(1, "Обов'язкове поле").max(13, "Максимум 13 символів"),
    users_count: z.
    coerce
      .number()
      .min(0, "Мінімум 0")
      .max(maxPlayersCount, `Максимум ${maxPlayersCount} гравців`),
    privacy_policy: z.boolean().refine((v) => v === true, "Потрібна згода з політикою"),
  })
}

type FormInput = z.infer<ReturnType<typeof createFormSchema>>;


interface FormProps {
  maxPlayersCount: number;
}

export default function Form({ maxPlayersCount }: FormProps) {
  const formSchema = useMemo(() => createFormSchema(maxPlayersCount), [maxPlayersCount]);
  const resolver = useZodValidationResolver(formSchema);
  const { register, handleSubmit, formState: { errors } } = useForm<FormInput>({
    resolver,
    defaultValues: { user_name: "", user_phone: "", users_count: 0, privacy_policy: false },

  });

  const onSubmit: SubmitHandler<FormInput> = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <div>
        <input
          {...register("user_name")}
          className={inputClassName}
          type="text"
          placeholder="Ваше ім'я"
        />
        {errors?.user_name?.message && (
          <p className="mt-1 text-sm text-red-500">{errors.user_name.message}</p>
        )}
      </div>
      <div>
        <input
          {...register("user_phone")}
          className={inputClassName}
          type="text"
          placeholder="Ваш номер телефону"
        />
        {errors?.user_phone?.message && (
          <p className="mt-1 text-sm text-red-500">{errors.user_phone.message}</p>
        )}
      </div>
      <div>
        <input
          {...register("users_count", { setValueAs: (v) => (v === "" ? 0 : Number(v)) })}
          className={inputClassName}
          type="number"
          min={0}
          max={maxPlayersCount}
          placeholder="Кількість гравців"
        />
        {errors?.users_count?.message && (
          <p className="mt-1 text-sm text-red-500">{errors.users_count.message}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <label
          htmlFor="privacy_policy"
          className="flex cursor-pointer items-center gap-3"
        >
          <input
            type="checkbox"
            {...register("privacy_policy", { setValueAs: (v) => !!v })}
            id="privacy_policy"
            className="peer sr-only"
          />
          <span
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded [&>svg]:hidden peer-checked:[&>svg]:flex"
            style={{ background: "#535353" }}
            aria-hidden
          >
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4L4 7L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>
            Я погоджуюсь з{" "}
            <a href="/privacy-policy" target="_blank" rel="noreferrer" className="text-accent hover:underline">
              політикою конфіденційності
            </a>
          </span>
        </label>
        {errors?.privacy_policy?.message && (
          <p className="mt-1 text-sm text-red-500">{errors.privacy_policy.message}</p>
        )}
      </div>
      <Button type="submit">Відправити заявку</Button>
    </form>
  );
}

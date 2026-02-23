import Button from "../../../components/Button";

export default function Form() {
    return (
        <form>
            <input className="px-6 py-4 rounded-md bg-input-gray w-full opacity-40 placeholder:text-gray"
            name="user_name"
            type="text" 
            placeholder="Ваше ім’я"
            required
            />
             <input className="px-6 py-4 rounded-md bg-input-gray w-full opacity-40 placeholder:text-gray"
             name="user_phone"
             type="text" 
             placeholder="Ваш номер телефону"
             required
             />
                         <input className="px-6 py-4 rounded-md bg-input-gray w-full opacity-40 placeholder:text-gray"
                         name="users_count"
             type="text" 
             placeholder="Кількість гравців"/>
             <div className="flex items-center gap-3">
                <label htmlFor="privacy_policy" className="flex cursor-pointer items-center gap-3">
                    <input
                        type="checkbox"
                        name="privacy_policy"
                        id="privacy_policy"
                        className="peer sr-only"
                    />
                    <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded [&>svg]:hidden peer-checked:[&>svg]:flex"
                        style={{ background: '#535353' }}
                        aria-hidden
                    >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 4L4 7L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                    <span>Я погоджуюсь з <a href="/privacy-policy" target="_blank" rel="noreferrer" className="text-accent hover:underline">політикою конфіденційності</a></span>
                </label>
            </div>
      <Button type="submit">Відправити заявку</Button>
    </form>
  );
}
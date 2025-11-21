import { redirect } from "next/navigation";


/** La url base '/' redirecciona inmediatamente al namku/home */
export default async function BasePage() {
    redirect('/namku/home');
}

import { Button } from "@/components/ui/button"
import {useRef} from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const usernameRef= useRef<HTMLInputElement>(null)
  const passwordRef= useRef<HTMLInputElement>(null)

  async function handleSubmit(e:React.FormEvent){
    e.preventDefault()
    const username= usernameRef.current?.value
    const password= passwordRef.current?.value
    const response= await fetch("http://localhost:3001/user/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password
      })

    })
    const data= await response.json()
    if(!response.ok){
      console.log(data.message)
      return 
    }
    console.log(data.message)
  }
  return (
    <div className="grid min-h-screen w-full place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white">
    <Card {...props} className="min-h-[460px] w-full max-w-[430px] shrink-0 border border-white/10 bg-slate-900/80 py-0 text-white shadow-2xl shadow-indigo-950/40 backdrop-blur-xl">
      <CardHeader className="gap-3 border-b border-white/10 px-8 py-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-indigo-300 uppercase">
          Get started
        </p>
        <CardTitle className="text-3xl font-semibold tracking-tight text-white">Create an account</CardTitle>
        <CardDescription className="text-slate-400">
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 py-7">
        <form onSubmit={handleSubmit}>
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input className="h-10 border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus-visible:border-indigo-400 focus-visible:ring-indigo-400/30" ref={usernameRef}id="username" type="text" placeholder="Enter your username" required />
            </Field>
            
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input className="h-10 border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus-visible:border-indigo-400 focus-visible:ring-indigo-400/30" ref={passwordRef} id="password" type="password" required />
              <FieldDescription className="text-slate-400">
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
           
            <FieldGroup>
              <Field>
                <Button className="h-10 w-full bg-indigo-500 text-white hover:bg-indigo-400" type="submit">Create Account</Button>
                <Button className="h-10 w-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" variant="outline" type="button">
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 pt-2 text-center text-slate-400">
                  Already have an account? <a className="font-medium text-indigo-300 hover:text-indigo-200" href="#">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
    </div>
  )
}

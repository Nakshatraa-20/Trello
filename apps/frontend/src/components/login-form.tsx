import { cn } from "cn"
import {useRef} from "react"
import {Link, useNavigate} from "react-router-dom"


import { Button } from "@/components/ui/button"
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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const usernameRef= useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const navigate= useNavigate()


  async function boardLogin(e:React.FormEvent){
    e.preventDefault()
    const username= usernameRef.current?.value;
    const password= passwordRef.current?.value;
    

   const response= await fetch("http://localhost:3001/user/signin",{
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
   localStorage.setItem("token",data.token)
   navigate("/dashboard")
    }

    
  
  return (
    <div
      className={cn(
        "grid min-h-screen place-items-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6",
        className,
      )}
      {...props}
    >
      <Card className="min-h-[460px] w-full max-w-[430px] border border-white/10 bg-slate-900/80 py-0 text-white shadow-2xl shadow-indigo-950/40 backdrop-blur-xl">
        <CardHeader className="gap-3 border-b border-white/10 px-8 py-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-indigo-300 uppercase">
            Welcome back
          </p>
          <CardTitle className="text-3xl font-semibold tracking-tight text-white">
            Sign in to your board
          </CardTitle>
          <CardDescription className="text-slate-400">
            Enter your username below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 py-7">
          <form className="flex h-full flex-col" onSubmit={boardLogin}>
            <FieldGroup className="gap-5">
            <Field>
      <FieldLabel htmlFor="username">Username</FieldLabel>
     <Input
     ref={usernameRef}
    id="username"
    type="text"
    placeholder="Enter your username"
    className="h-10 border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus-visible:border-indigo-400 focus-visible:ring-indigo-400/30"
    required
  />
   </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input className="h-10 border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus-visible:border-indigo-400 focus-visible:ring-indigo-400/30" ref={passwordRef} id="password" type="password" required />
              </Field>
              <Field>
                <Button className="h-10 w-full bg-indigo-500 text-white hover:bg-indigo-400" type="submit">
                  Sign in
                </Button>
                <Button className="h-10 w-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" variant="outline" type="button">
                  Login with Google
                </Button>
                <FieldDescription className="pt-2 text-center text-slate-400">
                  Don&apos;t have an account? <a className="font-medium text-indigo-300 hover:text-indigo-200" href="#">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )

}

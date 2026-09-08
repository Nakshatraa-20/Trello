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
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input ref={usernameRef}id="username" type="text" placeholder="Enter your username" required />
            </Field>
            
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input ref={passwordRef} id="password" type="password" required />
              <FieldDescription>
                Must be at least 8 characters long.
              </FieldDescription>
            </Field>
           
            <FieldGroup>
              <Field>
                <Button type="submit">Create Account</Button>
                <Button variant="outline" type="button">
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <a href="#">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}

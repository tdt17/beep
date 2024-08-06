import React, { FormEvent, useState } from 'react'
import { signInByLink } from '../firestore'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Box, Button, TextField, Typography } from '@mui/material'

const validate = (email: string, space: string | null): string[] => {
  const errors = []
  if (!email || typeof email !== 'string') {
    errors.push('Email is required')
  } else if (space && !email.endsWith(`@${space}`)) {
    errors.push(`Please use your @${space} email`)
  }
  return errors
}

export const SignInByLink: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const formRef = React.useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<string[]>([])
  const space = searchParams.get('space')

  const signIn = async (e: FormEvent) => {
    e.preventDefault()
    if (!formRef.current) {
      setErrors(['Something went wrong'])
      return
    }
    const formData = new FormData(formRef.current)
    const email = formData.get('email') as string

    const errorsErrors = validate(email, space)
    if (errorsErrors.length > 0) {
      setErrors(errorsErrors)
      return
    }

    await signInByLink(email)
    navigate(`./signInSent?email=${email}`)
  }

  return <div>
    <Typography component='h1' variant='h5'>
      Sign in
    </Typography>
    {errors.map((error, i) => <Alert key={i} severity='error'>{error}</Alert>)}
    <Box component='form' ref={formRef} onSubmit={signIn} noValidate sx={{ mt: 1 }}>
      <TextField
        margin='normal'
        required
        fullWidth
        id='email'
        label={`Email Address${space ? `(use @${space})` : ''}`}
        name='email'
        autoComplete='email'
        autoFocus
      />
      <Button
        type='submit'
        fullWidth
        variant='contained'
        sx={{ mt: 3, mb: 2 }}
      >
        Sign Up
      </Button>
    </Box>
  </div>
}

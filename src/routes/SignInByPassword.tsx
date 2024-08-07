import React, { FormEvent, useState } from 'react'
import { signInByPassword, signUpByPassword } from '../firestore'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Box, Button, TextField, Typography } from '@mui/material'
import { log } from '../config'
import { AuthErrorCodes } from 'firebase/auth'

const validate = (email: string, password: string, passwordConfirm: string | null, space: string | null): string[] => {
  const errors = []
  if (!email || typeof email !== 'string') {
    errors.push('Email is required')
  } else if (space && !email.endsWith(`@${space}`)) {
    errors.push(`Please use your @${space} email`)
  }
  if (!password || typeof password !== 'string') {
    errors.push('Password is required')
  }
  if (passwordConfirm != null && password != passwordConfirm) {
    errors.push('Passwords do not match')
  }
  return errors
}

export const SignInByPassword: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const formRef = React.useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<string[]>([])
  const space = searchParams.get('space')

  const signInUp = (create?: boolean) => async (e: FormEvent) => {
    e.preventDefault()
    if (!formRef.current) {
      setErrors(['Something went wrong'])
      return
    }
    const formData = new FormData(formRef.current)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const passwordConfirm = formData.get('passwordConfirm') as string | null

    const errorsErrors = validate(email, password, passwordConfirm, space)
    if (errorsErrors.length > 0) {
      setErrors(errorsErrors)
      return
    }
    try {
      if (create) {
        await signUpByPassword(email, password)
        navigate(`./signInSent?email=${email}`)
        return
      }
      await signInByPassword(email, password)
    } catch (e: any) { // eslint-disable-line
      if (e?.code === AuthErrorCodes.EMAIL_EXISTS) {
        log('email exists', e)
        setErrors(['Email already exists'])
        return
      }
      log('error signing in', e)
      setErrors(['Wrong email or password'])
    }
  }

  return <div>
    <Typography component='h1' variant='h5'>
      Sign in
    </Typography>
    {errors.map((error, i) => <Alert key={i} severity='error'>{error}</Alert>)}
    <Box component='form' ref={formRef} onSubmit={signInUp()} noValidate sx={{ mt: 1 }}>
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
      <TextField
        margin='normal'
        required
        fullWidth
        name='password'
        label='Password'
        type='password'
        id='password'
        autoComplete='current-password'
      />
      <Button
        type='submit'
        fullWidth
        variant='contained'
        sx={{ mt: 3, mb: 2 }}
      >
        Sign In
      </Button>
      <Typography variant='caption'>
        Don't have an account?<br />
        Just enter a new Email and Password and press "Sign Up".
      </Typography>
      <Button
        type='button'
        fullWidth
        variant='contained'
        sx={{ mt: 3, mb: 2 }}
        onClick={signInUp(true)}
      >
        Sign Up
      </Button>
    </Box>
  </div>
}

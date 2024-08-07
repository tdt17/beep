import { Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import { state } from '../firestore'
import { sendEmailVerification } from 'firebase/auth'

export const SignInSent: React.FC = () => {
  const [searchParams] = useSearchParams()

  return <div>
    <Typography component='h1' variant='h5'>
      Email sent    
    </Typography>
    <div>Please check your email: {searchParams.get('email')}</div>
    {state.user && !state.user.emailVerified && 
      <button onClick={() => sendEmailVerification(state.user!)}>Resend Email Verification</button>
    }
    <div>You may have to reload this page after clicking the link.</div>
  </div>
}
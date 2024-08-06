import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import { createBrowserRouter, redirect, RouterProvider } from 'react-router-dom'
import { checkIsSignInWithEmailLink, initState, signOut, state } from './firestore.ts'
import Month from './routes/Month.tsx'
import { SignInByLink } from './routes/SignInByLink.tsx'
import { SignInByPassword } from './routes/SignInByPassword.tsx'
import { SignInSent } from './routes/SignInSent.tsx'
import { runInAction } from 'mobx'
import { Alert } from '@mui/material'
import dayjs from 'dayjs'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        loader: async () => redirect(`/month`)
      },
      {
        path: '/month',
        element: <Month />,
        loader: async () => {
          const date = dayjs()
          runInAction(() => state.loadParams = { type: 'month', year: date.year(), month: date.month() })
          return null
        }
      },
      {
        path: '/signIn',
        element: <SignInByPassword />,
      },
      {
        path: '/signInByLink',
        element: <SignInByLink />,
      },
      {
        path: '/signInSent',
        element: <SignInSent />
      },
      {
        path: '/signOut',
        loader: async () => {
          console.log('signOut1')
          await signOut()
          console.log('signOut2')
          return redirect('/signIn')
        }
      },
      {
        path: '/signInFinish',
        loader: async () => {
          console.log('signInFinish1')
          try {
            await checkIsSignInWithEmailLink()
          } catch (e) {
            state.status = 'error'
            state.errorMessage = 'Error signing in with email link. Please try again.'
            console.error(e)
            return redirect('/signIn')
          }
          console.log('signInFinish2')
          return redirect('/')
        },
        element: <div>Finish Sign Up</div>
      },
      {
        path: '*',
        element: <Alert severity='error'>Page not found</Alert>
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)

initState()

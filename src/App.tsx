import { NavLink, Outlet, Route, Routes } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { state } from './firestore'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { Box, Container, CssBaseline, useMediaQuery } from '@mui/material'
import { useMemo } from 'react'

export const App: React.FC = observer(() => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  )

  return <ThemeProvider theme={theme}>
    <CssBaseline />
    <Container component='main' maxWidth='xs'>
      {state.isAdmin && <div style={{position: 'absolute', top: 10, right: 10}}>
        <Routes>
          <Route path='admin' element={<NavLink to='../month'>back</NavLink>} />
          <Route path='*' element={<NavLink to='./admin'>admin</NavLink>} />
        </Routes>
      </div>}
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {state.status === 'loading' && <div style={{ position: 'fixed', top: 10, left: 10 }}>Loading...</div>}
        {state.status === 'error' && <div>{state.errorMessage}</div>}
        {state.status === 'ready' && <Outlet />}
      </Box>
    </Container>
  </ThemeProvider>
})

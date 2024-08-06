import { Typography } from "@mui/material"
import logo from '../assets/logo.jpeg'

export const Logo = () => {
  return <>
    <Typography variant="caption">BEEP - Back-to-Office Employee Engagement Platform</Typography>
    <img style={{maxHeight: '90vh', maxWidth: '100vw'}} src={logo} alt="BEEP - Back-to-Office Employee Engagement Platform" />
  </>
}
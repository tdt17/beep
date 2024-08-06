import { Typography } from "@mui/material"
import logo from '../assets/logo.jpeg'

export const Logo = () => {
  return <>
    <Typography variant="caption">Back-to-Office Employee Engagement Platform</Typography>
    <img src={logo} alt="BEEP - Back-to-Office Employee Engagement Platform" />
  </>
}
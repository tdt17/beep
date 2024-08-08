import { Alert, Button, Stack, TextareaAutosize, TextField, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { setUserData, state } from "../firestore";
import { useNavigate } from "react-router-dom";

export const Team: React.FC = observer(() => {
  const [config, setConfig] = useState(state.userData.teamIds?.join('\n'))
  const [success, setSuccess] = useState<boolean>(false)
  const navigate = useNavigate()

  const save = () => {
    const teamIds = config?.split('\n').map(s => s.trim()).filter(Boolean) || []
    setUserData({ teamIds })
    setSuccess(true)
  }

  return <>
    <Typography component='h1' variant="h5">
      Team Config
    </Typography>
    {success && <Alert severity='success'>Saved</Alert>}
    <TextField
      value={state.user?.uid}
      variant="outlined"
      label="OWN UID (share with your team)"
      margin="normal"
      fullWidth
    />
    <Typography variant="caption">
      Paste here the UIDs of your team:
    </Typography>
    <TextareaAutosize
      value={config}
      onChange={e => { setConfig(e.target.value); setSuccess(false) }}
      style={{ width: '100%' }}
      minRows={3}
    />
    <Button onClick={save}>Save</Button>
    <Button onClick={() => { navigate('../') }}>Back</Button>
  </>
})
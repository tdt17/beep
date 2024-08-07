import { Alert, Button, TextareaAutosize, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { setSpaceData, state } from "../firestore";

export const Admin: React.FC = observer(() => {
  const [text, setText] = useState(JSON.stringify(state.spaceData, null, 2))
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState<boolean>(false)

  const validate = (text: string): SpaceData | null => { // 
    try {
      const data = JSON.parse(text)
      setErrors([])
      return data
    } catch (e: any) {
      setErrors([e.message])
      return null
    }
  }

  const save = async () => {
    const data = validate(text)
    if (!data) return
    try {
      await setSpaceData(data)
      setSuccess(true)
    }catch(e) {
      setErrors(['Error saving'])
    }
  }

  return <>
    <Typography component='h1' variant="h5">
      Admin
    </Typography>
    {errors.map((error, i) => <Alert key={i} severity='error'>{error}</Alert>)}
    {success && <Alert severity='success'>Saved</Alert>}
    <TextareaAutosize
      value={text}
      onChange={(e) => { validate(e.target.value); setText(e.target.value); setSuccess(false) }}
      style={{ width: '90vw' }}
    />
    <Button onClick={save}>Save</Button>
  </>
})
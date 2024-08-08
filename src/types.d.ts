type TableName = string

type UserData = {
  tableName: TableName
  teamIds: string[]
}

type SpaceData = {
  admins: string[]
  tableNamesSeats: {
    [tableName: TableName]: number
  }
}

type MonthData = {
  users: {
    [uid: string]: {
      [day: string]: TableName
    }
  }
}

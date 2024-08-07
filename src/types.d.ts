type TableName = string

type UserData = {
  tableName: TableName
}

type SpaceData = {
  admins: string[]
  tableNameCounts: {
    [tableName: TableName]: number
  }
}

type MonthData = {
  days: {
    [day: string]: {
      [uid: string]: TableName
    }
  }
}
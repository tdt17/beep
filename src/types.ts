type TableName = string

type UserData = {
  tableName: TableName
}

type SpaceData = {
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
import { Link } from 'react-router-dom'
import useIndexedDB, { IndexItem } from '../../hooks/useIndexedDB/useIndexedDB'
import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react'

type RecordTypeExample1 = {
  firstname: string,
  lastname: string,
  age: number
}

const IndexListExample1: IndexItem[] = [
  {
    name: 'firstname',
    keyPath: 'firstname',
  },
  {
    name: 'lastname',
    keyPath: 'lastname',
  },
  {
    name: 'age',
    keyPath: 'age',
  },
]

const RecordExample1: RecordTypeExample1[] = [
  {
    firstname: 'Jonny',
    lastname: 'Black',
    age: 30,
  },
  {
    firstname: 'Jonny',
    lastname: 'White',
    age: 31,
  },
  {
    firstname: 'Joseph',
    lastname: 'White',
    age: 31,
  },
  {
    firstname: 'Joy',
    lastname: 'Back',
    age: 33,
  },
  {
    firstname: 'Joy',
    lastname: 'Green',
    age: 31,
  },
  {
    firstname: 'Jonn',
    lastname: 'Lack',
    age: 20,
  },
]

export default function IndexedDBPage() {
  const [currentDB, setCurrentDB] = useState<IDBDatabase | undefined>(undefined)
  const [databaseName, setDatabaseName] = useState<string>('')
  const [storeName, setStoreName] = useState<string>('')
  const [firstname, setFirstname] = useState<string>('')
  const [lastname, setLastname] = useState<string>('')
  const [age, setAge] = useState<number>(0)
  const [recordKey, setRecordKey] = useState<string>('')
  const [recordValue, setRecordValue] = useState<string>('')
  const [indexName, setIndexName] = useState<string>('')
  const db = useIndexedDB()

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: Dispatch<SetStateAction<string>> | Dispatch<SetStateAction<number>>
  ) => {
    const value = e.target.value
    if (e.target.type === 'text') {
      ;(setter as Dispatch<SetStateAction<string>>)(value)
    }
    if (e.target.type === 'number') {
      if (!isNaN(+value)) {
        ;(setter as Dispatch<SetStateAction<number>>)(+value)
      }
      ;(setter as Dispatch<SetStateAction<number>>)(0)
    }
  }

  const handleDatabaseCreateClick = (name: string, version?: number) => {
    db.openDatabase({ dbName: name, dbVersion: version }).then((db) => {
      setCurrentDB(db)
    })
  }

  const handleCreateStoreClick = (
    name: string,
    options?: IDBObjectStoreParameters,
    indexList?: IndexItem[]
  ) => {
    if (currentDB) {
      db.createStore(currentDB, name, options, indexList).then((idb) => {
        RecordExample1.forEach((example) => {
          db.addRecord(idb, storeName, example)
        })
        setCurrentDB(idb)
      })
    }
  }

  const handleCreateRecordClick = () => {
    if (currentDB) {
      const record = {
        firstname: firstname,
        lastname: lastname,
        age: age,
      }
      db.addRecord(currentDB, storeName, record)
    }
  }

  const handleGetValueClick = () => {
    if (currentDB) {
      db.getValue(currentDB, storeName, +recordKey).then((value) => {
        setRecordValue(JSON.stringify(value))
      }).catch(() => {
        setRecordValue('')
      })
    }
  }

  const handleGetValueFromIndexClick = () => {
    if (currentDB) {
      db.getValueFromIndex(currentDB, storeName, indexName, recordKey, ).then((value) => {
        setRecordValue(JSON.stringify(value))
      }).catch(() => {
        setRecordValue('')
      })
    }
  }

 const handleGetAllValueClick = () => {
   if (currentDB) {
     db.getAllValue(currentDB, storeName).then((value) => {
       setRecordValue(JSON.stringify(value))
     })
   }
 } 

 const handleGetAllValueFromIndexClick = () => {
   if (currentDB) {
     db.getAllValueFromIndex(currentDB, storeName, indexName, recordKey).then((value) => {
       setRecordValue(JSON.stringify(value))
     })
   }
 } 

  return (
    <div>
      <div>
        <Link to={'/'}>Back</Link>
      </div>
      <h1>useIndexedDB hook example</h1>
      {currentDB && <p>{`Current Database: ${currentDB.name}`}</p>}
      {storeName && <p>{`Current Store: ${storeName}`}</p>}
      <div>
        <div>
          <input
            onChange={(e) => handleInputChange(e, setDatabaseName)}
            type="text"
            placeholder="enter database name"
          />
          <button onClick={() => handleDatabaseCreateClick(databaseName)}>
            create database
          </button>
        </div>
        <div>
          <input
            onChange={(e) => handleInputChange(e, setStoreName)}
            type="text"
            placeholder="enter store name"
          />
          <button
            onClick={() =>
              handleCreateStoreClick(
                storeName,
                {
                  keyPath: 'id',
                  autoIncrement: true,
                },
                IndexListExample1
              )
            }
          >
            create store
          </button>
        </div>
        <div>
          <input
            onChange={(e) => handleInputChange(e, setFirstname)}
            type="text"
            placeholder="firstname"
          />
          <input
            onChange={(e) => handleInputChange(e, setLastname)}
            type="text"
            placeholder="lastname"
          />
          <input
            onChange={(e) => handleInputChange(e, setAge)}
            type="number"
            placeholder="age"
          />
          <button onClick={handleCreateRecordClick}>add record</button>
        </div>
        <div>
          <input
            onChange={(e) => handleInputChange(e, setRecordKey)}
            type="text"
            placeholder="key"
          />
          <button onClick={handleGetValueClick}>get value</button>
          <button onClick={handleGetAllValueClick}>get all values</button>
        </div>
        <div>
          <input
            onChange={(e) => handleInputChange(e, setIndexName)}
            type="text"
            placeholder="index name"
          />
          <input
            onChange={(e) => handleInputChange(e, setRecordKey)}
            type="text"
            placeholder="key"
          />
          <button onClick={handleGetValueFromIndexClick}>get value</button>
          <button onClick={handleGetAllValueFromIndexClick}>get all values</button>
        </div>
        {recordValue && <div>{recordValue}</div> }
      </div>
    </div>
  )
}

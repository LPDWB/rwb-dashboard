import { useState } from 'react'
import * as XLSX from 'xlsx'

export default function Home() {
  const [data, setData] = useState([])

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (evt) => {
      const bstr = evt.target.result
      const wb = XLSX.read(bstr, { type: 'binary' })
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const json = XLSX.utils.sheet_to_json(ws)
      setData(json)
    }
    reader.readAsBinaryString(file)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">RWB Dashboard</h1>
        <button onClick={() => document.documentElement.classList.toggle('dark')}>
          Toggle Theme
        </button>
      </div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="mb-4" />
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
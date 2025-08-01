import { useEffect, useState } from "react"
import { columns, type Application } from "@/components/candidacy/columns"
import { DataTable } from "@/components/data-table"
import { getApplications } from "@/services/candidacy/candidacyService"

export default function ApplicationsPage() {
  const [data, setData] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  // Estados para filtros
  const [emailFilter, setEmailFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [dateFilter, setDateFilter] = useState("") // formato YYYY-MM-DD

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const result = await getApplications({ 
          page, 
          limit: limit === 0 ? undefined : limit,
          status: statusFilter,
          createdAt: dateFilter
        })

        const mappedData: Application[] = result.data.map((item: any) => ({
          id: item.id,
          candidateName: item.fullName,
          email: item.email,
          phone: item.phoneNumber || "-",
          location: `${item.location?.city?.name ?? ""} - ${item.location?.district?.name ?? ""}`,
          position: item.desiredPosition,
          status: item.status,
          appliedAt: new Date(item.createdAt).toLocaleDateString("pt-PT"),
        }))

        setData(mappedData)
        setTotalPages(result.totalPages || 1)
      } catch (error) {
        console.error("Erro ao carregar candidaturas", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [page, limit, statusFilter, dateFilter])

  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold mb-4">Lista de Candidaturas</h1>
      <div className="container mx-auto py-6">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <span className="text-blue-500 text-lg">🌀 Carregando...</span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
            limit={limit}
            setLimit={setLimit}
            filters={[
              {
                type: "input",
                column: "email",
                placeholder: "Filtrar emails...",
                value: emailFilter,
                onChange: setEmailFilter
              },
              {
                type: "select",
                placeholder: "Filtrar status",
                value: statusFilter || "all",
                onChange: (val) => setStatusFilter(val === "all" ? "" : val),
                options: [
                  { label: "Todos", value: "all" },
                  { label: "Pendente", value: "PENDING" },
                  { label: "Em Análise", value: "IN_REVIEW" },
                  { label: "Entrevista", value: "INTERVIEW" },
                  { label: "Aprovado", value: "ACCEPTED" },
                  { label: "Rejeitado", value: "REJECTED" },
                ]
              },
              {
                type: "date",
                column: "createdAt",
                placeholder: "Filtrar por data...",
                value: dateFilter,
                onChange: setDateFilter
              }
            ]}
          />
        )}
      </div>
    </div>
  )
}

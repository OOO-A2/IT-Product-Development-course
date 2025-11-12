import { Users } from "lucide-react"
import type { Team } from "../../types/types"

export default function TeamFilter(p: {teams: Team[], selectedTeam: any, setSelectedTeam: any}) {
    const [teams, selectedTeam, setSelectedTeam] = [p.teams, p.selectedTeam, p.setSelectedTeam]
    return <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
              >
                <option value="all">All Teams</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
}
// src/pages/DashboardPage.jsx
// Dashboard page - list meetings and options to create/join
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { meetingAPI } from '../utils/api'
import { generateRoomCode } from '../utils/roomCode'

export const DashboardPage = () => {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [meetingTitle, setMeetingTitle] = useState('')
  const [createdMeeting, setCreatedMeeting] = useState(null)
  const [copyStatus, setCopyStatus] = useState('')

  useEffect(() => {
    if (user && !authLoading) {
      fetchMeetings()
    }
  }, [user, authLoading])

  const fetchMeetings = async () => {
    try {
      setLoading(true)
      const response = await meetingAPI.getAll()
      setMeetings(response.data)
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to load meetings'
      setError(message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createInviteText = (meeting) => {
    if (!meeting) return ''
    return `Join my meeting:\n\nTitle: ${meeting.title || 'Untitled Meeting'}\nMeeting Code: ${meeting.roomCode}\nMeeting ID: ${meeting.id}\nLink: ${meeting.inviteLink}`
  }

  const handleCreateMeeting = async (e) => {
    e.preventDefault()
    setError('')
    setCopyStatus('')

    try {
      const roomCode = generateRoomCode()
      const response = await meetingAPI.create({
        title: meetingTitle,
        roomCode: roomCode,
        createdBy: user.uid,
      })

      const inviteLink = `${window.location.origin}/meeting/${response.data.id}`
      setCreatedMeeting({ ...response.data, inviteLink })
      setShowCreateForm(false)
      setMeetingTitle('')

      // Refresh meeting list after creation
      fetchMeetings()
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to create meeting'
      setError(message)
      console.error(err)
    }
  }

  const handleJoinMeeting = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const searchResponse = await meetingAPI.joinByCode(joinCode)
      const meetingId = searchResponse.data.id
      const response = await meetingAPI.joinById(meetingId)
      navigate(`/meeting/${response.data.id}`, {
        state: { roomCode: joinCode },
      })
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to join meeting. Check the code and try again.'
      setError(message)
      console.error(err)
    }
  }

  const handleCopyInvite = async () => {
    if (!createdMeeting) return
    const inviteText = createInviteText(createdMeeting)

    try {
      await navigator.clipboard.writeText(inviteText)
      setCopyStatus('Copied invite link and code!')
    } catch (err) {
      setCopyStatus('Copy failed. Please copy manually.')
      console.error(err)
    }
  }

  const handleShareInvite = async () => {
    if (!createdMeeting) return
    const inviteText = createInviteText(createdMeeting)

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Meeting invite: ${createdMeeting.title || 'Untitled Meeting'}`,
          text: inviteText,
          url: createdMeeting.inviteLink,
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      handleCopyInvite()
    }
  }

  const handleOpenMeeting = () => {
    if (!createdMeeting) return
    navigate(`/meeting/${createdMeeting.id}`, {
      state: { roomCode: createdMeeting.roomCode },
    })
  }

  return (
    <div className="min-h-screen text-slate-100 py-10 px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-[#ff2f6f]/20 blur-3xl" />
        <div className="absolute right-0 top-28 h-80 w-80 rounded-full bg-[#7f1e41]/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(183,45,72,0.18),_transparent_55%)]" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <div className="grid gap-6 xl:grid-cols-[1.33fr_0.95fr] mb-10">
          <div className="rounded-[32px] border border-white/10 bg-white/10 p-8 shadow-[0_40px_120px_rgba(20,6,30,0.22)] backdrop-blur-[30px]">
            <p className="text-sm uppercase tracking-[0.32em] text-fuchsia-300/80">Dashboard</p>
            <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-white">Welcome back, {user?.displayName || 'Host'}!</h1>
            <p className="mt-4 max-w-2xl text-slate-300 text-lg leading-8">
              Create your next session with rich ruby glass panels, share the invite instantly, and manage your room from a premium command center.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <p className="uppercase tracking-[0.28em] text-slate-500">Next meeting</p>
                <p className="mt-3 text-xl font-semibold text-white">{createdMeeting?.title || 'No meeting created yet'}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <p className="uppercase tracking-[0.28em] text-slate-500">Room code</p>
                <p className="mt-3 text-xl font-semibold text-fuchsia-300">{createdMeeting?.roomCode || '---'}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                <p className="uppercase tracking-[0.28em] text-slate-500">Meeting ID</p>
                <p className="mt-3 text-xl font-semibold text-white">{createdMeeting?.id || 'waiting...'}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {['Presenter', 'Guest', 'Stage'].map((label) => (
              <div
                key={label}
                className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(30,8,45,0.18)] backdrop-blur-[26px]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="h-14 w-14 rounded-3xl border border-white/15 bg-slate-950/65" />
                  <div className="space-y-1 text-right">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
                    <p className="text-sm text-slate-300">Waiting for participants</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-2">
                  <div className="h-2 rounded-full bg-white/10" />
                  <div className="h-2 w-4/5 rounded-full bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-500 bg-rose-950/80 p-4 text-rose-200">
            {error}
          </div>
        )}

        {createdMeeting && (
          <div className="mb-8 rounded-3xl border border-violet-500/40 bg-slate-900/90 p-6 shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-pink-400">Meeting ready</p>
                <h2 className="text-2xl font-semibold text-white mt-2">{createdMeeting.title || 'Untitled Meeting'}</h2>
                <p className="mt-2 text-slate-400">Meeting code and details are ready to share before you join.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleShareInvite}
                  className="rounded-full bg-gradient-to-r from-fuchsia-600 to-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 hover:opacity-95 transition"
                >
                  Share Invite
                </button>
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  className="rounded-full border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-700 transition"
                >
                  Copy Link & Code
                </button>
                <button
                  type="button"
                  onClick={handleOpenMeeting}
                  className="rounded-full border border-violet-500 bg-transparent px-5 py-3 text-sm font-semibold text-violet-300 hover:bg-violet-500/10 transition"
                >
                  Open Meeting
                </button>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-950/80 border border-slate-700 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Meeting ID</p>
                <p className="mt-2 break-all text-lg font-semibold text-white">{createdMeeting.id}</p>
              </div>
              <div className="rounded-2xl bg-slate-950/80 border border-slate-700 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Room Code</p>
                <p className="mt-2 text-2xl font-semibold text-fuchsia-300">{createdMeeting.roomCode}</p>
              </div>
              <div className="rounded-2xl bg-slate-950/80 border border-slate-700 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Invite Link</p>
                <p className="mt-2 break-all text-sm text-slate-300">{createdMeeting.inviteLink}</p>
              </div>
            </div>
            {copyStatus && <p className="mt-4 text-sm text-emerald-300">{copyStatus}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">Create</p>
                <h2 className="text-2xl font-semibold text-white">Schedule Meeting</h2>
              </div>
              <div className="rounded-full bg-violet-500/10 px-4 py-2 text-sm text-violet-300">Fast invite</div>
            </div>
            {showCreateForm ? (
              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <input
                  type="text"
                  placeholder="Meeting Title (optional)"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
                />
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/20 hover:opacity-95 transition"
                  >
                    Create & Show Invite
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 px-5 py-4 text-left text-white shadow-inner shadow-black/20 transition hover:scale-[1.01]"
              >
                <span className="block text-lg font-semibold">Create a new meeting</span>
                <span className="mt-2 block text-sm text-slate-400">
                  Generate meeting id, room code, and invite link instantly.
                </span>
              </button>
            )}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-lg">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Join</p>
                <h2 className="text-2xl font-semibold text-white">Enter Meeting Code</h2>
              </div>
              <div className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">Instant access</div>
            </div>
            <form onSubmit={handleJoinMeeting} className="space-y-4">
              <input
                type="text"
                placeholder="Enter meeting code (e.g., ABC-123)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
              />
              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-slate-700 via-violet-700 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 hover:opacity-95 transition"
              >
                Join with Code
              </button>
            </form>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-lg">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Recent Meetings</p>
              <h2 className="text-2xl font-semibold text-white">Your latest rooms</h2>
            </div>
            <p className="text-sm text-slate-400">Click any meeting to join instantly.</p>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-fuchsia-500"></div>
              <p className="text-slate-400 mt-3">Loading meetings...</p>
            </div>
          ) : meetings.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No meetings yet. Create one to get started!</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-xl shadow-slate-950/20 transition hover:-translate-y-1 hover:border-violet-500">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{meeting.title}</h3>
                      <p className="mt-2 text-slate-400">Code: <span className="text-fuchsia-300">{meeting.roomCode}</span></p>
                    </div>
                    <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase text-violet-200">{meeting.participantCount || 0} users</span>
                  </div>
                  <div className="mt-5 flex flex-col gap-3">
                    <div className="rounded-2xl bg-slate-900/80 p-4 text-sm text-slate-400">
                      ID: <span className="text-slate-100 break-all">{meeting.id}</span>
                    </div>
                    <button
                      onClick={() =>
                        navigate(`/meeting/${meeting.id}`, {
                          state: { roomCode: meeting.roomCode },
                        })
                      }
                      className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-600 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 hover:opacity-95 transition"
                    >
                      Join Meeting
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

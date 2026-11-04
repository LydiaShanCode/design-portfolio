import BentoGrid from './BentoGrid'
import WorkBar from './WorkBar'
import WorkFooter from './WorkFooter'
import WorkShell from './WorkShell'
import { WORK_TAGLINE, useWorkPreview, useWorkProjects } from './workFirst'

function BentoHome() {
  const projects = useWorkProjects()
  const { selected, open, close } = useWorkPreview()

  return (
    <WorkShell layout="bento" selected={selected} onClose={close}>
      <WorkBar tagline={WORK_TAGLINE} />
      <main id="work" className="wf-bento" aria-label="Selected work">
        <p className="wf-bento-intro">{WORK_TAGLINE}</p>
        <BentoGrid projects={projects} onOpen={open} />
      </main>
      <WorkFooter />
    </WorkShell>
  )
}

export default BentoHome

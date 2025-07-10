import Yup from './validation/yup/index'
import Zod from './validation/zod/index'
import Valibot from './validation/valibot/index'
import Effect from './validation/effect/index'
// import TanstackArrayFormApp from './forms/tanstack-form/TanstackArrayFormApp'
// import TanstackFormApp from './forms/tanstack-form/TanstackFormApp'
// import FinalFormArrayApp from './forms/react-finale-form/FinalFormArrayApp'
// import FinalFormApp from './forms/react-finale-form/FinalFormApp'
// import RHFApp from './forms/react-hook-form/RHFApp'
// import SWRApp from './state-managers/tanstack/TanstackApp'
// import TanstackApp from './state-managers/tanstack/TanstackApp'
// import ReatomApp from './state-managers/reatom/ReatomApp'
// import NanoApp from './state-managers/nanostores/NanostoresApp'
// import RtkApp from './state-managers/rtk/RtkApp'

const App = () => {
    Yup.Api()
    Zod.Api()
    Valibot.Api()
    Effect.Api()

    return null
}

export default App

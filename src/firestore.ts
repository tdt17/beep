import { initializeApp } from 'firebase/app'
import { User, getAuth, isSignInWithEmailLink, createUserWithEmailAndPassword, sendSignInLinkToEmail, signInWithEmailAndPassword, signInWithEmailLink, sendEmailVerification } from 'firebase/auth'
import { deleteField, doc, getFirestore, onSnapshot, setDoc } from 'firebase/firestore'
import { comparer, makeAutoObservable, reaction, runInAction } from 'mobx'
import { log } from './config'
import { redirect } from 'react-router-dom'
import dayjs, { Dayjs } from 'dayjs'


const SESSION_KEY_NEXT_HREF = 'redirectAfterLogin'
const firebaseConfig = {
  apiKey: 'AIzaSyBRG6R9wxEjXYSvm0DN7ILYAlgGozaMg1M',
  authDomain: 'ac-beep.firebaseapp.com',
  projectId: 'ac-beep',
  storageBucket: 'ac-beep.appspot.com',
  messagingSenderId: '938267738524',
  appId: '1:938267738524:web:b8ff0e5d00371af05cc859'
}
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const firestore = getFirestore(app)

export const state = makeAutoObservable({
  status: 'loading' as 'loading' | 'error' | 'ready',
  errorMessage: null as null | string,
  user: null as null | User,
  get space() {
    return state.user?.emailVerified && state.user?.email?.split('@').pop() || null
  },
  loadParams: null as null | { type: 'month', year: number, month: number },
  userData: {} as Partial<UserData>,
  spaceData: { tableNameCounts: {} } as SpaceData,
  monthData: {} as { [month: string]: MonthData },
  get mergedMonthData(): MonthData {
    return {
      days: Object.assign({}, ...Object.values(state.monthData).map(({ days }) => days))
    }
  },
  get userDays(): { [day: string]: TableName } {
    return Object.fromEntries(Object.entries(state.mergedMonthData.days)
      .map(([day, users]) => [day, users[state.user?.uid || '']])
      .filter(([, table]) => table)
    )
  },
  get daysTableCounts(): { [day: string]: { [tableName: string]: number } } {
    return Object.fromEntries(Object.entries(state.mergedMonthData.days).map(([day, users]) => [day,
      Object.values(users).reduce((counts, tableName) => ({ ...counts, [tableName]: (counts[tableName] || 0) + 1 }), {} as { [tableName: string]: number })
    ]))
  },
  get tableName(): TableName {
    if (state.userData.tableName && state.userData.tableName in state.spaceData.tableNameCounts) {
      return state.userData.tableName
    }
    return ''
  },
})
log('state', state)
// autorun(() => console.log('state', toJS(state)))

export async function initState() {
  await checkIsSignInWithEmailLink()
  auth.onAuthStateChanged(user => {
    runInAction(() => {
      if (user) {
        log('login success', user)
        if (!user.emailVerified) {
          console.log('email not verified')
          redirect('/signInSent?email=' + user.email)
        }
        if (location.pathname.startsWith('/signIn')) {
          location.href = localStorage.getItem(SESSION_KEY_NEXT_HREF) || '/'
        }
        state.user = user
      } else if (!location.pathname.startsWith('/signIn')) {
        if (location.pathname !== '/signOut') {
          localStorage.setItem(SESSION_KEY_NEXT_HREF, location.href)
        }
        location.href = '/signIn'
      }
    })
  })

  reaction(() => ({ space: state.space, loadParams: state.loadParams }), async ({ space, loadParams }) => {
    if (!space || !loadParams) return
    if (loadParams.type === 'month') {
      const month = dayjs(`${loadParams.year}-${loadParams.month}`)
      const monthKeys = [month.add(-1, 'month'), month, month.add(1, 'month')].map(calcMonthKey)
      monthKeys.forEach(monthKey => {
        const docRef = doc(firestore, 'spaces', space, 'month', monthKey)
        const unsubscribe = onSnapshot(docRef, (snapshot) => {
          if (!snapshot.exists()) {
            return
          }
          runInAction(() => {
            state.monthData[monthKey] = snapshot.data() as MonthData || null
          })
        })
        loadUnsubscribes[monthKey] = unsubscribe
      })
      Object.entries(loadUnsubscribes).forEach(([monthKey, unsubscribe]) => {
        if (!monthKeys.includes(monthKey)) {
          unsubscribe()
          delete loadUnsubscribes[monthKey]
        }
      })
    }
  }, { equals: comparer.structural })

  reaction(() => ({ space: state.space }), ({ space }) => {
    if (!space) return
    const docRef = doc(firestore, 'spaces', space)
    onSnapshot(docRef, (snapshot) => {
      if (!snapshot.exists()) {
        return
      }
      runInAction(() => {
        state.spaceData = snapshot.data() as SpaceData || {}
      })
    })
  }, { equals: comparer.structural })

  reaction(() => ({ space: state.space, uid: state.user?.uid }), ({ space, uid }) => {
    if (!space || !uid) return
    const docRef = doc(firestore, 'spaces', space, 'users', uid)
    onSnapshot(docRef, (snapshot) => {
      runInAction(() => {
        state.userData = snapshot.data() || {}
        state.status = 'ready'
      })
    })
  }, { equals: comparer.structural })
}

const loadUnsubscribes = {} as { [month: string]: () => void }


export async function signOut() {
  return auth.signOut()
}

export async function signInByPassword(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password)
}

export async function signUpByPassword(email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await sendEmailVerification(user)
}

export async function signInByLink(email: string) {
  const search = new URLSearchParams()
  search.set('email', email)
  search.set('next', localStorage.getItem(SESSION_KEY_NEXT_HREF) || '/')
  const actionCodeSettings = {
    url: `${location.origin}/signInFinish?${search.toString()}`,
    handleCodeInApp: true
  }
  log('signIn', auth, email, actionCodeSettings)
  return sendSignInLinkToEmail(auth, email, actionCodeSettings)
}

export async function checkIsSignInWithEmailLink() {
  if (isSignInWithEmailLink(auth, location.href)) {
    const search = new URLSearchParams(location.search)
    const email = search.get('email')
    if (!email) {
      throw new Error('Email is required for confirmation')
    }
    await signInWithEmailLink(auth, email, location.href)
      .then((result) => {
        log('login with link success', result)
        location.href = search.get('next') || '/'
      })
  }
}

export async function setDayInOffice(day: Dayjs, tableName: TableName | null) {
  if (!state.space || !state.user) return
  const docRef = doc(firestore, 'spaces', state.space, 'month', calcMonthKey(day))
  await setDoc(docRef, { days: { [calcDayKey(day)]: { [state.user.uid]: tableName || deleteField() } } }, { merge: true })
}


export async function setUserData(userData: Partial<UserData>) {
  if (!state.space || !state.user) return
  const docRef = doc(firestore, 'spaces', state.space!, 'users', state.user.uid)
  await setDoc(docRef, userData, { merge: true })
}

export const calcMonthKey = (day: Dayjs) => day.format('YYYY-MM')
export const calcDayKey = (day: Dayjs) => day.format('YYYY-MM-DD')

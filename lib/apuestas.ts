import { db } from './firebase'
import {
  collection, addDoc, updateDoc, getDocs,
  doc, query, where, orderBy, serverTimestamp, increment
} from 'firebase/firestore'

// Guardar apuesta
export async function guardarApuesta(
  userId: string,
  partido: any,
  seleccion: string,
  cuota: number,
  puntosApostados: number
) {
  const gananciasPosibles = Math.round(puntosApostados * cuota)

  await addDoc(collection(db, 'apuestas'), {
    userId,
    partidoId:       partido.id,
    partido:         `${partido.home} vs ${partido.away}`,
    liga:            partido.league,
    seleccion,
    cuota,
    puntosApostados,
    gananciasPosibles,
    estado:          'pendiente',
    fechaApuesta:    serverTimestamp(),
    fechaPartido:    partido.utcDate || '',
  })
}

// Obtener apuestas de un usuario
export async function getMisApuestas(userId: string) {
  const q = query(
    collection(db, 'apuestas'),
    where('userId', '==', userId),
    orderBy('fechaApuesta', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Resolver apuesta (admin)
export async function resolverApuesta(
  apuestaId: string,
  userId: string,
  resultado: 'ganada' | 'perdida',
  ganancia: number
) {
  await updateDoc(doc(db, 'apuestas', apuestaId), {
    estado:         resultado,
    fechaResolucion: serverTimestamp(),
  })

  if (resultado === 'ganada') {
    await updateDoc(doc(db, 'users', userId), {
      puntosActuales:  increment(ganancia),
      puntosHistorico: increment(ganancia),
      totalApuestas:   increment(1),
    })
  } else {
    await updateDoc(doc(db, 'users', userId), {
      totalApuestas: increment(1),
    })
  }
}

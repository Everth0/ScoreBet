import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const decoded = await getAuth().verifyIdToken(token)
    const uid = decoded.uid

    const { apuestaId } = await req.json()
    if (!apuestaId) {
      return NextResponse.json({ error: 'Falta apuestaId' }, { status: 400 })
    }

    const db = getFirestore()
    const apuestaRef = db.collection('apuestas').doc(apuestaId)

    const resultado = await db.runTransaction(async (tx) => {
      const apuestaSnap = await tx.get(apuestaRef)
      if (!apuestaSnap.exists) {
        throw new Error('La apuesta no existe')
      }
      const apuesta = apuestaSnap.data()!

      if (apuesta.userId !== uid) {
        throw new Error('Esta apuesta no te pertenece')
      }
      if (apuesta.estado !== 'pendiente') {
        throw new Error('Solo se pueden cancelar apuestas pendientes')
      }
      if (!apuesta.partidoAplazado) {
        throw new Error('Solo se pueden cancelar apuestas de partidos aplazados')
      }

      const puntosApostados = apuesta.puntosApostados || 0
      const userRef = db.collection('users').doc(uid)

      tx.update(userRef, {
        puntosActuales: FieldValue.increment(puntosApostados),
      })
      tx.update(apuestaRef, {
        estado: 'cancelada',
        fechaResolucion: new Date(),
      })

      return { puntosDevueltos: puntosApostados }
    })

    return NextResponse.json({ ok: true, ...resultado })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

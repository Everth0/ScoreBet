import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

type CrearPerfilBody = {
  nombre?: unknown
  email?: unknown
  codigoRef?: unknown
}

function generarCodigo(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let codigo = ''
  for (let i = 0; i < 8; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return codigo
}

async function generarCodigoUnico(uid: string): Promise<string> {
  const db = getFirestore()

  for (let intento = 0; intento < 5; intento++) {
    const codigo = generarCodigo()
    const snap = await db
      .collection('users')
      .where('codigoReferido', '==', codigo)
      .limit(1)
      .get()

    if (snap.empty) return codigo
  }

  return `${generarCodigo().slice(0, 6)}${uid.slice(0, 2).toUpperCase()}`
}

async function buscarReferidor(codigo: string) {
  if (codigo.length !== 8) return null

  const snap = await getFirestore()
    .collection('users')
    .where('codigoReferido', '==', codigo)
    .limit(1)
    .get()

  return snap.empty ? null : snap.docs[0]
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const decoded = await getAuth().verifyIdToken(token)
    const body = (await req.json().catch(() => ({}))) as CrearPerfilBody

    const uid = decoded.uid
    const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : ''
    const emailBody = typeof body.email === 'string' ? body.email.trim() : ''
    const email = decoded.email || emailBody
    const codigoRef = typeof body.codigoRef === 'string'
      ? body.codigoRef.trim().toUpperCase().slice(0, 8)
      : ''

    const db = getFirestore()
    const userRef = db.collection('users').doc(uid)
    const codigoPropio = await generarCodigoUnico(uid)
    const referidorDoc = codigoRef ? await buscarReferidor(codigoRef) : null
    const uidReferidor = referidorDoc && referidorDoc.id !== uid ? referidorDoc.id : ''
    const puntosIniciales = uidReferidor ? 800 : 500

    const result = await db.runTransaction(async transaction => {
      const userSnap = await transaction.get(userRef)

      if (userSnap.exists) {
        return {
          existed: true,
          referidoAplicado: Boolean(userSnap.data()?.referidoPor),
          puntosIniciales: userSnap.data()?.puntosActuales || 0,
        }
      }

      transaction.set(userRef, {
        uid,
        nombre,
        email,
        codigoReferido:  codigoPropio,
        referidoPor:     uidReferidor,
        codigoUsado:     uidReferidor ? codigoRef : '',
        puntosActuales:  puntosIniciales,
        puntosHistorico: puntosIniciales,
        adsHoy:          0,
        totalReferidos:  0,
        totalApuestas:   0,
        referidos:       [],
        fechaRegistro:   FieldValue.serverTimestamp(),
      })

      if (uidReferidor) {
        transaction.update(db.collection('users').doc(uidReferidor), {
          puntosActuales:  FieldValue.increment(300),
          puntosHistorico: FieldValue.increment(300),
          totalReferidos:  FieldValue.increment(1),
          referidos:       FieldValue.arrayUnion(uid),
        })
      }

      return {
        existed: false,
        referidoAplicado: Boolean(uidReferidor),
        puntosIniciales,
      }
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('Error creando perfil:', error)
    return NextResponse.json({ error: 'No se pudo crear el perfil' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Inicializar Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:    process.env.FIREBASE_PROJECT_ID,
      clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:   process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export async function GET(req: NextRequest) {
  // Verificar que viene de Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const db = getFirestore()

    // Obtener todos los usuarios
    const usersSnap = await db.collection('users').get()

    // Reset en batch (más eficiente)
    const batch = db.batch()
    let count = 0

    usersSnap.docs.forEach(doc => {
      if ((doc.data().adsHoy || 0) > 0) {
        batch.update(doc.ref, { adsHoy: 0 })
        count++
      }
    })

    await batch.commit()

    console.log(`Reset diario: ${count} usuarios actualizados`)

    return NextResponse.json({
      ok: true,
      usuariosReseteados: count,
      fecha: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error en reset diario:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

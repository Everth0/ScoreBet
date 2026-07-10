import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export async function GET(req: NextRequest) {
  const codigo = req.nextUrl.searchParams.get('codigo')?.trim().toUpperCase() || ''

  if (codigo.length !== 8) {
    return NextResponse.json({ valido: false })
  }

  try {
    const snap = await getFirestore()
      .collection('users')
      .where('codigoReferido', '==', codigo)
      .limit(1)
      .get()

    return NextResponse.json({ valido: !snap.empty })
  } catch (error) {
    console.error('Error validando referido:', error)
    return NextResponse.json({ valido: false }, { status: 500 })
  }
}

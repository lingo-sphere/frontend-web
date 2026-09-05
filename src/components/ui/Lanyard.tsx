/**
 * @file lanyard.tsx
 * @description Component giao diện React Lanyard cho học viên
 */

'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import * as THREE from 'three'
import { ArrowDown, CheckCircle2 } from 'lucide-react'
import { landingLocales, type LandingLang } from '@/components/landing/landing.locales'

export interface LanyardProps {
  destinationUrl?: string
  lang?: LandingLang
  onUnlock?: () => void
  className?: string
}

interface Joint {
  pos: THREE.Vector3
  oldPos: THREE.Vector3
}

function drawCardCanvas(canvas: HTMLCanvasElement, lang: LandingLang) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const texts = landingLocales[lang]?.lanyard || landingLocales.vi.lanyard

  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1440)
  bgGrad.addColorStop(0, '#0a1a17')
  bgGrad.addColorStop(0.4, '#061311')
  bgGrad.addColorStop(1, '#020605')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1024, 1440)

  ctx.strokeStyle = '#5eead4'
  ctx.lineWidth = 14
  ctx.strokeRect(30, 30, 964, 1380)

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.lineWidth = 4
  ctx.strokeRect(50, 50, 924, 1340)

  ctx.fillStyle = '#000000'
  ctx.fillRect(412, 55, 200, 28)
  ctx.strokeStyle = '#5eead4'
  ctx.lineWidth = 4
  ctx.strokeRect(412, 55, 200, 28)

  ctx.fillStyle = '#5eead4'
  ctx.font = 'bold 34px monospace'
  ctx.fillText(`● ${texts.vipPassport}`, 80, 150)

  ctx.fillStyle = '#ffffff'
  ctx.font = '900 64px system-ui, sans-serif'
  ctx.fillText('LINGOSPHERE', 80, 235)

  ctx.fillStyle = '#48c9b0'
  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.fillText(texts.academy, 80, 280)

  const chipGrad = ctx.createLinearGradient(80, 350, 260, 490)
  chipGrad.addColorStop(0, '#fef08a')
  chipGrad.addColorStop(0.5, '#eab308')
  chipGrad.addColorStop(1, '#854d0e')
  ctx.fillStyle = chipGrad
  ctx.fillRect(80, 350, 180, 135)
  ctx.strokeStyle = '#fef9c3'
  ctx.lineWidth = 4
  ctx.strokeRect(80, 350, 180, 135)

  ctx.fillStyle = '#713f12'
  ctx.fillRect(80, 415, 180, 7)
  ctx.fillRect(165, 350, 7, 135)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.fillRect(300, 350, 644, 135)
  ctx.strokeStyle = 'rgba(94, 234, 212, 0.4)'
  ctx.lineWidth = 3
  ctx.strokeRect(300, 350, 644, 135)

  ctx.fillStyle = '#ffffff'
  ctx.font = '900 50px monospace'
  ctx.fillText(texts.targetBadge, 330, 415)

  ctx.fillStyle = '#5eead4'
  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.fillText(texts.statusAuth, 330, 460)

  const holoGrad = ctx.createLinearGradient(80, 530, 944, 910)
  holoGrad.addColorStop(0, 'rgba(47, 127, 120, 0.45)')
  holoGrad.addColorStop(0.5, 'rgba(94, 234, 212, 0.2)')
  holoGrad.addColorStop(1, 'rgba(192, 132, 252, 0.35)')
  ctx.fillStyle = holoGrad
  ctx.fillRect(80, 530, 864, 380)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
  ctx.lineWidth = 3
  ctx.strokeRect(80, 530, 864, 380)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'italic 300 36px serif'
  if (lang === 'vi') {
    ctx.fillText('"Học tiếng Anh bằng tư duy tự nhiên,', 120, 670)
    ctx.fillText('bứt phá điểm số cùng AI."', 120, 725)
  } else {
    ctx.fillText('"Master English with natural logic,', 120, 670)
    ctx.fillText('supercharged by AI."', 120, 725)
  }

  ctx.fillStyle = '#5eead4'
  ctx.font = 'bold 30px system-ui, sans-serif'
  ctx.fillText(texts.sparkEngine, 120, 830)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.fillText(texts.studentLabel, 80, 990)

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 46px system-ui, sans-serif'
  ctx.fillText(texts.studentName, 80, 1055)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = 'bold 26px system-ui, sans-serif'
  ctx.fillText(texts.accessCodeLabel, 650, 990)

  ctx.fillStyle = '#5eead4'
  ctx.font = 'bold 46px monospace'
  ctx.fillText('LS-990-PRO', 650, 1055)

  ctx.fillStyle = '#ffffff'
  let bx = 80
  const barPattern = [12, 6, 18, 8, 24, 6, 10, 14, 8, 20, 6, 14, 10, 18, 6, 22, 10, 8, 16, 6, 14, 18, 8, 12, 16]
  for (const w of barPattern) {
    ctx.fillRect(bx, 1160, w, 100)
    bx += w + 12
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.font = '24px monospace'
  ctx.fillText('* L I N G O S P H E R E - 2 0 2 6 *', 320, 1310)
}

export function Lanyard({
  destinationUrl = '/home',
  lang = 'vi',
  onUnlock,
  className = '',
}: LanyardProps) {
  const router = useRouter()
  const mountRef = useRef<HTMLDivElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const cardCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const cardTextureRef = useRef<THREE.CanvasTexture | null>(null)
  const isUnlockedRef = useRef<boolean>(false)
  const [isUnlockedState, setIsUnlockedState] = useState<boolean>(false)
  const [isHovered, setIsHovered] = useState<boolean>(false)

  const texts = landingLocales[lang]?.lanyard || landingLocales.vi.lanyard

  const triggerAccess = useCallback(() => {
    if (isUnlockedRef.current) return
    isUnlockedRef.current = true
    setIsUnlockedState(true)

    if (onUnlock) {
      onUnlock()
    } else {
      setTimeout(() => {
        router.push(destinationUrl)
      }, 600)
    }
  }, [destinationUrl, onUnlock, router])

  useEffect(() => {
    if (cardCanvasRef.current && cardTextureRef.current) {
      drawCardCanvas(cardCanvasRef.current, lang)
      cardTextureRef.current.needsUpdate = true
    }
  }, [lang])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const getContainerSize = () => ({
      w: container.clientWidth || window.innerWidth || 1200,
      h: container.clientHeight || 700,
    })

    const initialSize = getContainerSize()
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, initialSize.w / initialSize.h, 0.1, 100)
    camera.position.set(0, 0, 8.5)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(initialSize.w, initialSize.h)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    const ambientLight = new THREE.AmbientLight(0xffffff, 2.2)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0x5eead4, 4.0)
    keyLight.position.set(5, 5, 5)
    scene.add(keyLight)

    const purpleRim = new THREE.DirectionalLight(0xa855f7, 3.0)
    purpleRim.position.set(-5, -2, 4)
    scene.add(purpleRim)

    const topLight = new THREE.SpotLight(0xffffff, 5, 15, Math.PI / 4, 0.5)
    topLight.position.set(0, 6, 4)
    scene.add(topLight)

    const cardCanvas = document.createElement('canvas')
    cardCanvas.width = 1024
    cardCanvas.height = 1440
    cardCanvasRef.current = cardCanvas
    drawCardCanvas(cardCanvas, lang)

    const cardTexture = new THREE.CanvasTexture(cardCanvas)
    cardTexture.colorSpace = THREE.SRGBColorSpace
    cardTexture.anisotropy = 8
    cardTextureRef.current = cardTexture

    const ribbonCanvas = document.createElement('canvas')
    ribbonCanvas.width = 1024
    ribbonCanvas.height = 128
    const rctx = ribbonCanvas.getContext('2d')
    if (rctx) {
      rctx.fillStyle = '#113a36'
      rctx.fillRect(0, 0, 1024, 128)

      rctx.strokeStyle = '#5eead4'
      rctx.lineWidth = 6
      rctx.strokeRect(0, 4, 1024, 120)

      rctx.fillStyle = '#ffffff'
      rctx.font = 'bold 36px monospace'
      rctx.fillText('✦ LINGOSPHERE ACADEMY ✦ ETS 990 ✦ VIP STUDENT ✦', 40, 75)
    }
    const ribbonTexture = new THREE.CanvasTexture(ribbonCanvas)
    ribbonTexture.wrapS = THREE.RepeatWrapping
    ribbonTexture.wrapT = THREE.RepeatWrapping
    ribbonTexture.repeat.set(2, 1)

    const cardGroup = new THREE.Group()

    const cardWidth = 1.9
    const cardHeight = 2.7
    const cardGeo = new THREE.BoxGeometry(cardWidth, cardHeight, 0.035)
    const cardMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x1d5a54, metalness: 0.7, roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0x1d5a54, metalness: 0.7, roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0x1d5a54, metalness: 0.7, roughness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0x1d5a54, metalness: 0.7, roughness: 0.3 }),
      new THREE.MeshPhysicalMaterial({
        map: cardTexture,
        metalness: 0.35,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 0.95,
      }),
      new THREE.MeshStandardMaterial({ color: 0x050c0b, metalness: 0.8, roughness: 0.25 }),
    ]

    const cardMesh = new THREE.Mesh(cardGeo, cardMaterials)
    const clampOffset = cardHeight / 2 + 0.24
    cardMesh.position.set(0, -clampOffset, 0)
    cardMesh.castShadow = true
    cardGroup.add(cardMesh)

    const clampGeo = new THREE.BoxGeometry(0.48, 0.24, 0.08)
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 })
    const clampMesh = new THREE.Mesh(clampGeo, metalMat)
    clampMesh.position.set(0, -0.14, 0)
    cardGroup.add(clampMesh)

    const ringGeo = new THREE.TorusGeometry(0.14, 0.03, 16, 32)
    const ringMesh = new THREE.Mesh(ringGeo, metalMat)
    ringMesh.position.set(0, 0, 0)
    cardGroup.add(ringMesh)

    scene.add(cardGroup)

    const numJoints = 5
    const anchorY = 2.55
    const ropeLength = 0.75
    const restDistance = ropeLength / (numJoints - 1)
    const joints: Joint[] = []

    for (let i = 0; i < numJoints; i++) {
      const y = anchorY - (i / (numJoints - 1)) * ropeLength
      joints.push({
        pos: new THREE.Vector3(0, y, 0),
        oldPos: new THREE.Vector3(0, y, 0),
      })
    }

    const ribbonSegments = 20
    const ribbonVertexCount = (ribbonSegments + 1) * 2
    const ribbonIndicesCount = ribbonSegments * 6

    const posArray = new Float32Array(ribbonVertexCount * 3)
    const uvArray = new Float32Array(ribbonVertexCount * 2)
    const indexArray = new Uint16Array(ribbonIndicesCount)

    let idxOffset = 0
    for (let i = 0; i < ribbonSegments; i++) {
      const base = i * 2
      indexArray[idxOffset++] = base
      indexArray[idxOffset++] = base + 1
      indexArray[idxOffset++] = base + 2
      indexArray[idxOffset++] = base + 1
      indexArray[idxOffset++] = base + 3
      indexArray[idxOffset++] = base + 2
    }

    const ribbonGeo = new THREE.BufferGeometry()
    ribbonGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    ribbonGeo.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2))
    ribbonGeo.setIndex(new THREE.BufferAttribute(indexArray, 1))

    const ribbonMat = new THREE.MeshStandardMaterial({
      map: ribbonTexture,
      roughness: 0.55,
      metalness: 0.2,
      side: THREE.DoubleSide,
    })

    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat)
    scene.add(ribbonMesh)

    const updateRibbon = () => {
      const curvePts = joints.map((j) => j.pos)
      const curve = new THREE.CatmullRomCurve3(curvePts)
      const sampled = curve.getPoints(ribbonSegments)
      const ribbonWidth = 0.18

      let vOffset = 0
      let uOffset = 0

      sampled.forEach((pt, i) => {
        const t = i / ribbonSegments
        posArray[vOffset++] = pt.x - ribbonWidth / 2
        posArray[vOffset++] = pt.y
        posArray[vOffset++] = pt.z

        posArray[vOffset++] = pt.x + ribbonWidth / 2
        posArray[vOffset++] = pt.y
        posArray[vOffset++] = pt.z

        uvArray[uOffset++] = 0
        uvArray[uOffset++] = t * 2
        uvArray[uOffset++] = 1
        uvArray[uOffset++] = t * 2
      })

      ribbonGeo.attributes.position.needsUpdate = true
      ribbonGeo.attributes.uv.needsUpdate = true
      ribbonGeo.computeVertexNormals()
    }

    let isDragging = false
    let currentPull = 0
    const pointer = new THREE.Vector2()
    const raycaster = new THREE.Raycaster()
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const planeIntersect = new THREE.Vector3()
    const dragOffset = new THREE.Vector3()
    const targetPos = new THREE.Vector3()

    const getPointerPos = (e: MouseEvent | TouchEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
    }

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      getPointerPos(e)
      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObject(cardMesh, true)
      if (intersects.length > 0 && raycaster.ray.intersectPlane(plane, planeIntersect)) {
        isDragging = true
        container.style.cursor = 'grabbing'
        const lastJoint = joints[numJoints - 1]
        dragOffset.copy(lastJoint.pos).sub(planeIntersect)
        targetPos.copy(lastJoint.pos)
      }
    }

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      getPointerPos(e)
      if (!isDragging) {
        raycaster.setFromCamera(pointer, camera)
        const intersects = raycaster.intersectObject(cardMesh, true)
        const hovered = intersects.length > 0
        container.style.cursor = hovered ? 'grab' : 'auto'
        setIsHovered(hovered)
        return
      }

      raycaster.setFromCamera(pointer, camera)
      if (raycaster.ray.intersectPlane(plane, planeIntersect)) {
        const lastJoint = joints[numJoints - 1]
        targetPos.copy(planeIntersect).add(dragOffset)

        targetPos.x = Math.max(-5.5, Math.min(5.5, targetPos.x))
        targetPos.y = Math.max(-2.5, Math.min(1.6, targetPos.y))

        lastJoint.pos.lerp(targetPos, 0.45)
        lastJoint.oldPos.copy(lastJoint.pos)

        const defaultJointY = anchorY - ropeLength
        currentPull = Math.max(0, Math.min(1, (defaultJointY - lastJoint.pos.y) / 1.4))

        if (progressBarRef.current) {
          progressBarRef.current.style.width = `${(currentPull * 100).toFixed(1)}%`
        }
      }
    }

    const onPointerUp = () => {
      if (isDragging) {
        isDragging = false
        container.style.cursor = 'grab'

        if (currentPull >= 0.8) {
          triggerAccess()
        }

        currentPull = 0
        if (progressBarRef.current) {
          progressBarRef.current.style.width = '0%'
        }
      }
    }

    const dom = renderer.domElement
    dom.addEventListener('mousedown', onPointerDown)
    window.addEventListener('mousemove', onPointerMove)
    window.addEventListener('mouseup', onPointerUp)
    dom.addEventListener('touchstart', onPointerDown, { passive: true })
    window.addEventListener('touchmove', onPointerMove, { passive: true })
    window.addEventListener('touchend', onPointerUp)

    let animId: number
    const gravity = new THREE.Vector3(0, -9.8, 0)
    const damping = 0.98

    const animate = () => {
      animId = requestAnimationFrame(animate)

      for (let i = 1; i < numJoints; i++) {
        if (i === numJoints - 1 && isDragging) continue

        const j = joints[i]
        const vel = j.pos.clone().sub(j.oldPos).multiplyScalar(damping)
        j.oldPos.copy(j.pos)
        j.pos.add(vel).add(gravity.clone().multiplyScalar(0.0011))
      }

      for (let iter = 0; iter < 12; iter++) {
        joints[0].pos.set(0, anchorY, 0)

        for (let i = 0; i < numJoints - 1; i++) {
          const j1 = joints[i]
          const j2 = joints[i + 1]
          const delta = j2.pos.clone().sub(j1.pos)
          const dist = delta.length()
          if (dist === 0) continue
          const diff = (dist - restDistance) / dist

          if (i === 0) {
            j2.pos.sub(delta.multiplyScalar(diff))
          } else if (i + 1 === numJoints - 1 && isDragging) {
            j1.pos.add(delta.multiplyScalar(diff))
          } else {
            j1.pos.add(delta.multiplyScalar(diff * 0.5))
            j2.pos.sub(delta.multiplyScalar(diff * 0.5))
          }
        }
      }

      const lastJoint = joints[numJoints - 1]
      cardGroup.position.copy(lastJoint.pos)

      const targetRotZ = THREE.MathUtils.clamp(-lastJoint.pos.x * 0.14, -0.45, 0.45)
      const targetRotY = THREE.MathUtils.clamp(lastJoint.pos.x * 0.22, -0.55, 0.55)
      const targetRotX = THREE.MathUtils.clamp((lastJoint.pos.y - 1.8) * 0.16, -0.3, 0.3)

      cardGroup.rotation.z += (targetRotZ - cardGroup.rotation.z) * 0.15
      cardGroup.rotation.y += (targetRotY - cardGroup.rotation.y) * 0.15
      cardGroup.rotation.x += (targetRotX - cardGroup.rotation.x) * 0.15

      updateRibbon()

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth || window.innerWidth || 1200
      const h = container.clientHeight || 700
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      dom.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('mouseup', onPointerUp)
      dom.removeEventListener('touchstart', onPointerDown)
      window.removeEventListener('touchmove', onPointerMove)
      window.removeEventListener('touchend', onPointerUp)
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [destinationUrl, triggerAccess])

  return (
    <div className={`relative w-full h-[620px] sm:h-[720px] mx-auto flex flex-col items-center justify-start select-none touch-none overflow-hidden ${className}`}>
      
      <div ref={mountRef} className="w-full h-full" />

      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[340px] text-center z-30 pointer-events-none px-4">
        {isUnlockedState ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-[#2f7f78] border border-[#5eead4] px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_35px_rgba(94,234,212,0.95)] animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-[#5eead4]" />
            {texts.granted}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5">
            
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden border border-white/20 backdrop-blur-md">
              <div
                ref={progressBarRef}
                className="h-full w-0 bg-gradient-to-r from-[#2f7f78] via-[#48c9b0] to-[#5eead4] rounded-full shadow-[0_0_15px_#5eead4]"
              />
            </div>

            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#5eead4] drop-shadow-[0_0_12px_rgba(94,234,212,0.8)]">
              <ArrowDown className={`w-4 h-4 ${isHovered ? 'animate-bounce' : ''}`} />
              {texts.promptPull}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Lanyard

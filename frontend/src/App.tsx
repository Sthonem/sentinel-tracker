import { Viewer, Entity } from 'resium'
import { Cartesian3, Ion } from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Viewer full>
        <Entity
          name="Gdańsk"
          position={Cartesian3.fromDegrees(18.6466, 54.352, 100)}
          point={{ pixelSize: 12, color: { red: 1, green: 0.5, blue: 0, alpha: 1 } as any }}
          description="Home base"
        />
      </Viewer>
    </div>
  )
}

export default App
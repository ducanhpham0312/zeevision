import { StyledButton } from './components/StyledButton';
import { useUIStore } from './contexts/useUIStore'

function App() {
  const { count, increaseCount } = useUIStore();

  return (
    <>
      <h1>Vite + React</h1>
      <div>
        <StyledButton onClick={increaseCount}>
          {`count is ${count.toString()}`}
        </StyledButton>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
    </>
  )
}

export default App

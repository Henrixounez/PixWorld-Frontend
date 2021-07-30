import styled from 'styled-components'
import Canvas from './canvas';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: lightblue;
  overflow: hidden;
`;

export default function Home() {
  return (
    <Container>
      <Canvas />
    </Container>
  )
}



export default function Home() {

  return (
    <h1>Hello world</h1>
  )
}


export const getServerSideProps = async () => {

  fetch('http://localhost:3333/pools/count')
    .then(response => response.json())
    .then(data => {
      console.log(data)
    })
}
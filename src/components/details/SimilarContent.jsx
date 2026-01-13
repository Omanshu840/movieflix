import ContentRow from '../home/ContentRow'

const SimilarContent = ({ items, title }) => {
  return (
    <div>
      <ContentRow title={title} items={items} />
    </div>
  )
}

export default SimilarContent

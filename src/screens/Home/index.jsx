import React, { useState } from 'react'
import { FlatList, View, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import LoadingAnimation from '../components/LoadingAnimation'
import SearchInput from './SearchInput'
import FilterPill from './FilterPill'
import ShowCard from './ShowCard'
import PersonCard from './PersonCard'
import tmdb from '../../services/tmdb'
import { mixArrays } from '../../utils'

const Home = () => {
  const { navigate } = useNavigation()
  const [isLoading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [tvShows, setTvShows] = useState([])
  const [movies, setMovies] = useState([])
  const [people, setPeople] = useState([])
  const filters = [
    useState({ label: 'TV Shows', enabled: true }),
    useState({ label: 'Movies', enabled: true }),
    useState({ label: 'People', enabled: true }),
  ]
  const result = mixArrays(
    filters[0][0].enabled ? tvShows : [],
    filters[1][0].enabled ? movies : [],
    filters[2][0].enabled ? people : [],
  )

  const handleSearch = () => {
    setLoading(true)
    const params = {
      include_adult: false,
      query: searchText,
    }

    Promise.all([
      tmdb.get('/search/tv', { params }).then((response) => setTvShows(response.data.results)),
      tmdb.get('/search/movie', { params }).then((response) => setMovies(response.data.results)),
      tmdb.get('/search/person', { params }).then((response) => setPeople(response.data.results)),
    ]).then(() => setLoading(false))
  }

  return (
    <>
      <SearchInput
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={() => searchText && handleSearch()}
      />
      <View style={{ flexGrow: 1 }}>
        <FlatList
          horizontal
          data={filters}
          keyExtractor={(_, index) => `${index}`}
          renderItem={({ item }) => (
            <FilterPill state={item} />
          )}
        />
        {isLoading ? (
          <LoadingAnimation />
        ) : (
          <FlatList
            data={result}
            keyExtractor={({ id }) => `${id}`}
            renderItem={({ item }) => item.backdrop_path !== undefined ? (
              <TouchableOpacity onPress={() => navigate('MovieDetails', item)}>
                <ShowCard {...item} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => navigate('MovieDetails', item)}>
                <PersonCard {...item} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </>
  )
}

export default Home

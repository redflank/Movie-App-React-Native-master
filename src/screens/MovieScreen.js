import {
  View,
  Text,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  StyleSheet,
  Linking,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  fetchMovieCredits,
  fetchMovieDetails,
  fetchSimilarMovies,
  image500,
  getVideo,
} from "../../utils/moviesapi";
import { ChevronLeftIcon } from "react-native-heroicons/outline";
import { HeartIcon } from "react-native-heroicons/solid";
import { Ionicons } from "@expo/vector-icons";
import Loading from "../components/Loading";
import Cast from "../components/Cast";
import PopularMovie from "../components/PopularMovie";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

var { width, height } = Dimensions.get("window");

const setWidth = (w) => (width / 100) * w;

export default function MovieScreen() {
  const { params: item } = useRoute();
  const navigation = useNavigation();
  const [movie, setMovie] = useState({});
  const [cast, setCast] = useState([]);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFavorite, toggleFavourite] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMovieDetails(item.id);
    getMovieCredits(item.id);
    getSimilarMovies(item.id);
  }, [item]);

  // Function to Fetch Movie Details

  const getMovieDetails = async (id) => {
    const data = await fetchMovieDetails(id);
    setLoading(false);
    if (data) {
      setMovie({ ...movie, ...data });
    }
  };

  const getMovieCredits = async (id) => {
    const data = await fetchMovieCredits(id);
    if (data) {
      setCast(data.cast);
    }
  };

  const getSimilarMovies = async (id) => {
    const data = await fetchSimilarMovies(id);
    if (data && data.results) {
      setSimilarMovies(data.results);
    }
  };

  console.log("Similar Movies", similarMovies);

  const formatPopularity = (popularity) => {
    const percentage = (popularity / 1000) * 170;
    return `${Math.round(percentage)} %`;
  };
  const formatRuntime = (runtime) => {
    const hours = Math.floor(runtime / 60);
    const minutes = runtime % 60;

    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}mins`;
    }
  };
  // console.log("Movie Details", movie);

  // Function to Add Movie to Saved Screen

  const toggleFavouriteAndSave = async () => {
    try {
      // Check if Movie is already in Storage
      const savedMovies = await AsyncStorage.getItem("savedMovies");
      let savedMoviesArray = savedMovies ? JSON.parse(savedMovies) : [];
      console.log("Check if the movie is already saved");

      // Chcek if the movie is already in the saved list
      const isMovieSaved = savedMoviesArray.some(
        (savedMovie) => savedMovie.id === item.id
      );

      console.log("Check if the movie is already in the saved list");

      if (!isMovieSaved) {
        // If movie is not saved, add it to the saved list
        savedMoviesArray.push(movie);
        await AsyncStorage.setItem(
          "savedMovies",
          JSON.stringify(savedMoviesArray)
        );
        toggleFavourite(true);
        console.log("Movie is added to the list of saved movies");
      } else {
        // If movie is already saved, remove it from the list
        const updatedSavedMoviesArray = savedMoviesArray.filter(
          (savedMovie) => savedMovie.id !== item.id
        );
        await AsyncStorage.setItem(
          "savedMovies",
          JSON.stringify(updatedSavedMoviesArray)
        );
        toggleFavourite(false);
        console.log("Movie is removed from the list of saved movies");
      }
    } catch (error) {
      console.log("Error Saving Movie", error);
    }
  };

  useEffect(() => {
    // Load savd movies from AsyncStorage when the component mounts
    const loadSavedMovies = async () => {
      try {
        const savedMovies = await AsyncStorage.getItem("savedMovies");
        const savedMoviesArray = savedMovies ? JSON.parse(savedMovies) : [];

        // Check if the movie is already in the saved list
        const isMovieSaved = savedMoviesArray.some(
          (savedMovie) => savedMovie.id === item.id
        );

        toggleFavourite(isMovieSaved);
        console.log("Check if the current movie is in the saved list");
      } catch (error) {
        console.log("Error Loading Saved Movies", error);
      }
    };

    loadSavedMovies();
  }, [item.id]);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 20,
      }}
      className="flex-1 ng-neutral-900"
    >
      {/* Back Button and Movie Poster */}
      <View className="w-full">
        {/* Back and Heart Icon */}
        <View className="z-20 w-full flex-row justify-between items-center px-4 mt-12 absolute">
          {/* Back Icon */}
          <View className="bg-[#2496ff] p-2 rounded-full items-center justify-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ChevronLeftIcon size={30} strokeWidth={2} color="white" />
            </TouchableOpacity>
          </View>

          {/* Heart Icon */}
          <View className="bg-[#2496ff] p-2 rounded-full items-center justify-center">
            <TouchableOpacity onPress={toggleFavouriteAndSave}>
              <HeartIcon
                size={30}
                strokeWidth={2}
                color={isFavorite ? "red" : "white"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Movie Image */}
        {loading ? (
          <Loading />
        ) : (
          <View>
            <Image
              source={{
                uri:
                  image500(movie.poster_path) ||
                  "https://th.bing.com/th/id/R.4dc29c271625202308a26ed96d1d962d?rik=qKnKhs7roVDpXA&pid=ImgRaw&r=0",
              }}
              style={{
                width,
                height: height * 0.55,
              }}
            />
            <TouchableOpacity
              style={styles.playButton}
              onPress={() => {
                if (movie?.videos?.results?.length > 0) {
                  Linking.openURL(getVideo(movie.videos.results[0].key));
                } else {
                  // Handle the case when 'videos' or 'results' is undefined or empty
                  console.error("No video available for this movie.");
                  // You might want to provide a fallback behavior or message here
                }
              }}
            >
              <Ionicons name="play-circle-outline" size={70} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Movie Details */}
      <View
        className="space-y-3 flex-1 bg-white relative py-4 mt-[-98] overflow-hidden"
        style={{
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
        }}
      >
        <Image
          source={require("../../assets/images/homescreen1.png")}
          style={{
            width,
            height,
          }}
          resizeMode="cover"
          className="absolute top-0 left-0"
        />

        {/* Movie Title */}

        <View className="space-y-3 p-4">
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              style={{ width: 200 }}
              className="text-white text-left text-2xl font-bold tracking-widest"
            >
              {movie?.title}
            </Text>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() =>
                Share.share({
                  message: `${movie?.title}\n\n${movie?.homepage}`,
                })
              }
            >
              <Text className="text-white text-left text-2xl font-bold tracking-widest">
                Share
              </Text>
            </TouchableOpacity>
          </View>
          {/* Genres */}
          <Text className="flex-row space-x-2">
            {movie?.genres?.map((genre, index) => {
              let showDot = index + 1 != movie.genres.length;

              return (
                <Text
                  key={index}
                  className="text-neutral-400 font-semibold text-base text-center"
                >
                  {genre?.name} {showDot ? "• " : null}
                </Text>
              );
            })}
          </Text>

          {/* Release Year, Runtime */}
          {movie?.id ? (
            <View className=" bg-[#2496ff] p-2 w-3/4 rounded-lg]">
              <Text className="text-white font-semibold text-base text-left">
                {formatPopularity(movie?.popularity)}
                {" * "}
                {formatRuntime(movie?.runtime)} {}{" "}
                {movie?.release_date?.split("-")[0] || "N/A"}
              </Text>
            </View>
          ) : null}

          {/* Description */}
          <Text className="text-neutral-300 text-sm tracking-widest leading-6">
            {movie?.overview}
          </Text>

          {/* Cast */}

          {movie?.id && cast.length > 0 && (
            <Cast navigation={navigation} cast={cast} />
          )}

          {/* Similar Movies */}
          {movie?.id && similarMovies.length > 0 && (
            <PopularMovie title="Similar Movies" data={similarMovies} />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  playButton: {
    position: "absolute",
    top: 110,
    left: setWidth(50) - 70 / 2,
    elevation: 10,
  },
});

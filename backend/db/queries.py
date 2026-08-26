def find_shortest_path(db, player_a, player_b):
  query = """
    // Find the top 1 match for player A
    CALL db.index.fulltext.queryNodes('player_names', $a)
    YIELD node AS p1, score AS score1
    WITH p1 ORDER BY score1 DESC LIMIT 1

    // Find the top 1 match for player B
    CALL db.index.fulltext.queryNodes('player_names', $b)
    YIELD node AS p2, score AS score2
    WITH p1, p2 ORDER BY score2 DESC LIMIT 1

    // Ensure distinct players
    WHERE p1 <> p2

    // Traverse graph for the two resolved players
    MATCH path = (p1)-[:PLAYED_FOR*1..3]-(p2)
    WITH path, nodes(path) AS nodes
    RETURN 
      [node IN nodes |
        CASE 
          WHEN 'Player' IN labels(node) THEN node.name
          ELSE '{' + node.name + '}'
        END
      ] AS sequence,
      length(path) AS hops
    ORDER BY hops ASCBruno Fernande
    LIMIT 3
  """
  return db.execute_query(query, {"a": player_a, "b": player_b})


def find_indirect_alumnus(db, star_player, excluded_club):
  """
    Find players who share a club connection with an alumnus 
    of any club [star_player] has played for, but have never 
    played for [excluded_club].
  """
  query = """
    // 1. Get the best-matching star player (limit to 1)
    CALL db.index.fulltext.queryNodes('player_names', $star)
    YIELD node AS star, score AS score1
    WITH star ORDER BY score1 DESC LIMIT 1

    // Pass 'star' forward to step 2
    WITH star

    // 2. Get the best-matching excluded club (limit to 1)
    CALL db.index.fulltext.queryNodes('club_names', $exclude) 
    YIELD node AS excludedClub, score AS score2
    WITH star, excludedClub ORDER BY score2 DESC LIMIT 1

    // 3. Get the set of players who played for the excluded club
    MATCH (excludedClub)<-[:PLAYED_FOR]-(excludedPlayer:Player)
    WITH star, excludedClub, COLLECT(excludedPlayer) AS excludedPlayers

    // 4. Find all direct teammates of the star
    MATCH (star)-[:PLAYED_FOR]->(:Club)<-[:PLAYED_FOR]-(teammate:Player)
    WHERE teammate <> star
    WITH DISTINCT teammate, star, excludedPlayers
    LIMIT 50

    // 5. For each teammate, find clubs they played for and distant players
    MATCH (teammate)-[:PLAYED_FOR]->(c:Club)<-[:PLAYED_FOR]-(distant:Player)
    WHERE distant <> teammate 
      AND distant <> star
      AND NOT distant IN excludedPlayers
    RETURN DISTINCT 
      distant.name AS distant_player,
      teammate.name AS connector,
      c.name AS via_club
    LIMIT 20
  """
  return db.execute_query(
    query,
    {"star": star_player, "exclude": excluded_club}
  )

def get_largest_squads(db):
  """
  Find the clubs with the most connected players in our dataset.
  """
  query = """
    MATCH (c:Club)<-[:PLAYED_FOR]-(p:Player)
    RETURN c.name AS club, COUNT(p) AS player_count
    ORDER BY player_count DESC
    LIMIT 5
  """
  return db.execute_query(query)

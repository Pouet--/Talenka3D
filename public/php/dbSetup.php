<?php
	// Create the return object
	$res = array();
	$res[0] = '';		// First slot is used for errors report
	
	// Connect to a database
	try{
		$db = new PDO('mysql:host=localhost; dbname=talenka3d', 'root', '142857qkdzyp4');
	}
	catch (Exception $e){
		$res[0] = 'Connexion refusée ' . $e->getMessage();
	}
	
    /**
     * Fait une sélection dans la base de donnée et renvoit un tableau
     *
     * @param  string $quoi      Liste des propriétés à sélectionner
     * @param  string $dans      Table où chercher les données
     * @param  string $condition (facultatif)
     * @param  string $ordre     (facultatif)
     * @param  string $limites   (facultatif)
     * @return array
     */
    function select($quoi, $dans, $condition='', $ordre='', $limites='')
    {
		global $db;
		global $res;
		
        $q = $db->query("SELECT ".$quoi
						." FROM ".$dans
						.(empty($condition)?"":" WHERE ".$condition)
						.(empty($ordre)?"":" ORDER BY ".$ordre)
						.(empty($limites)?"":" LIMIT ".$limites));
		
		if(!$q){
			$res[0] = 'wrong SQL request, query object is undefined';
		}else{
			// Fill return object with db values
			while($data = $q->fetch(PDO::FETCH_ASSOC)){
				$res[] = $data;
			}
		}
    }
	
    /**
     * Modifie des données dans la base
     *
     * @todo À améliorer
     * @param  string $q
     * @return array
     */
    function update($q)
    {
        $q = $db->query("UPDATE ".((string) $q));
    }
	
    /**
     * Insère des données dans la base
     *
     * @param  string $table	Table où insérer les données
	 * @param  array $columns	En-têtes des colonnes
	 * @param  array $values	Valeurs correspondantes
     */
    function insert($table, $columns, $values)
    {
		global $res;
		$nb_elems = count($columns);
		
		if(count($values) != $nb_elems)
		{
			$res[0] = 'Number of values different than columns';
		}
		else
		{
			global $db;
			
			// A revoir.
			// Ptet + rapide d'ecrire directement en SQL
			$q = "INSERT INTO ".$table."(";
			for($i=0; $i<$nb_elems - 1; $i++){
				$q .= $columns[$i].", ";
			}
			$q .= end($columns).")";
			
			$q .= " VALUES(";
			for($i=0; $i<$nb_elems - 1; $i++){
				$q .= "'".$values[$i]."', ";
			}
			$q .= "'".end($values)."')";
			
			$query = $db->prepare($q);
			if(!$query->execute())
			{
				$res[0] = $query->errorInfo();
			} else {
				//$res[1] = $query->lastRowId();
			}
		}
    }
	
    /**
     * Supprime des données dans la base
     *
     * @todo À améliorer et à protéger un maximum
     * @param  string $q
     * @return array
     */
    function delete($q)
    {
        $q = $db->query("DELETE FROM ".((string) $q));
    }
?>
blocks_count=`ls | sort -n | grep -o '[0-9]*' | wc -l`
errors=0

for ((file=1;file<=$blocks_count;file++))
do
    if [ $file != 1 ]; then
        hash_written=`tail -1 "$file.txt"`
        hash_calculated=`sha256sum $(($file-1)).txt | awk '{print $1}'`
        if [ "$hash_written" != "$hash_calculated" ]; then
            ((errors++))
        fi
    fi
done

if [ $errors == 0 ]; then
    final_hash=`tail -1 final.txt`
    hash_calculated=`sha256sum $(($blocks_count)).txt | awk '{print $1}'`
    if [ "$final_hash" == "$hash_calculated" ]; then
        echo "$blocks_count blocks"
        echo "chain is flawless"
        echo "final hash = $final_hash"
    fi
else
    echo "chain is corrupted"
fi

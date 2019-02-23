export const Pivot = (inTable, inColumn, inSums) =>
{
    var i, j;
    var output;
    var row;
    var cell;
    var sums;
    output = [];
    rows: for(i in inTable.Rows)
    {
        row = inTable.Rows[i];
        cell = row[inColumn].toString().toLowerCase();
        uniques: for(j in output)
        {
            if(cell == output[j].Name)
            {
                output[j].Rows.push(row);
                continue rows;
            }
        }
        sums = [];
        for(j in inSums)
        {
            sums[j] = 0;
        }
        output.push({
            Name:cell,
            Rows:[row],
            Parent:inTable,
            Sums:sums
        });
    }
    return output;
};

export const PivotTree = (inTable, inColumns, inDepth, inSums) =>
{
    var i;
    SumReset(inTable, inSums);
    inTable.Children = Pivot(inTable, inColumns[inDepth]);
    inDepth++;
    if(inDepth == inColumns.length)
    {
        for(i in inTable.Children)
        {
            SumReset(inTable.Children[i], inSums);
            Sum(inTable.Children[i], inSums);
            SumTree(inTable.Children[i], inSums);
        }
    }
    else
    {
        for(i in inTable.Children)
        {
            PivotTree(inTable.Children[i], inColumns, inDepth, inSums);
        }
    }

};

export const Sum = (inTable, inSums) =>
{
    var j, k;
    var add;
    for(j in inSums)
    {
        for(k in inTable.Rows)
        {
            add = inTable.Rows[k][inSums[j]];
            inTable.Sums[j] += add;
        }
    }
};

export const SumReset = (inTable, inSums) =>
{
    var i;
    inTable.Sums = [];
    for(i in inSums)
    {
        inTable.Sums[i] = 0;
    }
};

// push sums from inTable to inTable.Parent
export const SumTree = (inTable) =>
{
    var i;
    if(inTable.Parent)
    {
        for(i in inTable.Sums)
        {
            inTable.Parent.Sums[i] += inTable.Sums[i];
        }
        SumTree(inTable.Parent);
    }
};